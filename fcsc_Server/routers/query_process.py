import time
import pandas as pd
import sqlparse # For formatting SQL output
from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional

from main import app_state # Import the global app_state
from models.common import QueryInput, QueryProcessResponse
from models.agents import (
    SchemaLoaderResponse, SelectorAgentResponse, DecomposerAgentResponse,
    RefinerAgentResponse, DatabaseExecutionResponse, VisualizationAgentResponse
)
from utils.processing_steps import _add_processing_step

# Assuming these agents and database functions are external and remain as is.
from agents.schema_loader_agent import SchemaLoaderAgent
from agents.selector_agent import SelectorAgent
from agents.decomposer_agent import DecomposerAgent
from agents.refiner_agent import RefinerAgent
from agents.visualization_agent_3 import VisualizationAgent
from database import execute_sql_query_db, get_database_schema_string
from translation import detect_languages, translate_text_to_eng, translate_text_to_ar
import asyncio # Required for async translation functions


router = APIRouter(
    prefix="", # No prefix, as /query-process is a top-level endpoint
    tags=['Query-Process']
)

@router.post("/query-process/{lang}", summary="Process Natural Language Query", response_model=QueryProcessResponse)
async def process_query(query_input: QueryInput, lang:str="english"):
    """
    Processes a natural language query through a series of agents (Schema Loader, Selector, Decomposer, Refiner,
    Database Execution, Visualization) to generate SQL, execute it, and provide insights.
    Supports language detection and translation for Arabic queries.
    """
    overall_start_time = time.time()
    # Reset states for the new query
    app_state["processing_steps"] = []
    app_state["last_query_processed"] = query_input.query # Store original user query
    app_state["last_query_processed_english"] = None # Will store English version
    app_state["last_query_processed_arabic"] = None # Will store Arabic version (if applicable)
    app_state["last_sql_generated"] = None
    app_state["last_result_df"] = None
    app_state["current_summary_insights_eng"] = None # Reset summary insights
    app_state["current_summary_insights_ar"] = None
    app_state["current_data_insights_eng"] = None    # Reset data insights
    app_state["current_data_insights_ar"] = None
    app_state["last_suggested_visualization"] = "Table"
    app_state["last_decomposition"] = None
    app_state["last_selector_agent_run"] = None
    app_state["last_decomposer_agent_run"] = None
    app_state["last_refiner_agent_run"] = None
    app_state["last_db_execution_run"] = None
    app_state["last_visualization_agent_run"] = None

    original_query = query_input.query
    query_for_agents = original_query # This will be the English version used by agents
    sql_query_final = None
    result_data_final = None
    suggested_visualization_final = "Table"
    summary_insights_final = None # Will store summary insights (translated to Arabic if needed)
    data_insights_final = None    # Will store detailed data insights (translated to Arabic if needed)
    error_final = None

    detected_lang = 'en' # Default to English

    try:
        # Language Detection and Translation
        lang_detect_start = time.time()
        detected_lang = await detect_languages(original_query) # Assuming external translation function
        lang_detect_time = time.time() - lang_detect_start
        # _add_processing_step(app_state, "Language Detection", "✅ Language detected", f"Detected language: {detected_lang}", lang_detect_time)

        if detected_lang == 'ar':
            translation_start = time.time()
            query_for_agents = await translate_text_to_eng(original_query) # Assuming external translation function
            app_state["last_query_processed_arabic"] = original_query # Store Arabic original
            translation_time = time.time() - translation_start
            # _add_processing_step(app_state, "Translation (Arabic to English)", "✅ Query translated", f"Original: '{original_query}' -> English: '{query_for_agents}'", translation_time)
        else:
            app_state["last_query_processed_arabic"] = None # No Arabic version if not detected as Arabic
            # _add_processing_step(app_state, "Translation", "ℹ️ No translation needed", "Query is already in English or not Arabic.", 0.0)

        app_state["last_query_processed_english"] = query_for_agents # Store English version for agents

        # 1. Schema Loader Agent
        schema_start_time = time.time()
        db_schema_string, schema_load_time = SchemaLoaderAgent.load_schema_from_db() # Assuming external agent
        app_state["db_schema_string"] = db_schema_string # Update global schema
        schema_status = "✅ Schema loaded from database"
        schema_details = f"Database schema (length {len(db_schema_string)}) available."
        if "Error" in db_schema_string or not db_schema_string:
            schema_status = "❌ Failed to load schema or schema is empty"
            schema_details = db_schema_string
        step1 = _add_processing_step(app_state, "Schema Loader", schema_status, schema_details, schema_load_time)
        app_state["last_schema_loader_run"] = SchemaLoaderResponse(
            status=step1.status, details=step1.details, schema_content=db_schema_string if "Error" not in db_schema_string else None, time_taken=step1.time_taken
        )
        if "Error" in db_schema_string or not db_schema_string:
            raise ValueError(f"Schema not loaded or empty: {db_schema_string}")

        # 2. Selector Agent
        selector_start_time = time.time()
        answerable, explanation, needs_decomposition, selector_time = SelectorAgent.is_query_answerable(query_for_agents, db_schema_string) # Assuming external agent
        selector_status = "✅ Query deemed answerable" if answerable else "⚠️ Query potentially not answerable"
        selector_details_dict = {"answerable": answerable, "explanation": explanation, "needs_decomposition": needs_decomposition}
        step2 = _add_processing_step(app_state, "Selector Agent", selector_status, selector_details_dict, selector_time)
        app_state["last_selector_agent_run"] = SelectorAgentResponse(status=step2.status, details=step2.details, time_taken=step2.time_taken)

        if not answerable:
            print(f"Warning: Selector Agent indicated query might not be answerable. Explanation: {explanation}")
            error_final = f"Query not answerable: {explanation}"
            overall_time_seconds = time.time() - overall_start_time
            return QueryProcessResponse(
                original_query=original_query,
                sql_query=None,
                result_data=None,
                suggested_visualization=None,
                summary_insights=None,
                data_insights=None,
                processing_steps=app_state["processing_steps"], # Only schema loader and selector will be here
                total_time_seconds=overall_time_seconds,
                error=error_final
            )

        # 3. Decomposer Agent (Conditional)
        decomposition_result = None
        if needs_decomposition:
            decomposer_start_time = time.time()
            decomposition_result, decomposer_time = DecomposerAgent.decompose_query(query_for_agents, db_schema_string) # Assuming external agent
            app_state["last_decomposition"] = decomposition_result
            decomposer_status = "✅ Query decomposed"
            if isinstance(decomposition_result, str) and "Error" in decomposition_result:
                decomposer_status = "❌ Decomposition failed"
            step3 = _add_processing_step(app_state, "Decomposer Agent", decomposer_status, decomposition_result, decomposer_time)
            app_state["last_decomposer_agent_run"] = DecomposerAgentResponse(status=step3.status, details=step3.details, time_taken=step3.time_taken)
            if decomposer_status == "❌ Decomposition failed":
                raise ValueError(f"Decomposition failed: {decomposition_result}")
        else:
            _add_processing_step(app_state, "Decomposer Agent", "ℹ️ Skipped", "Decomposition not deemed necessary by Selector Agent.", 0.0)
            app_state["last_decomposer_agent_run"] = DecomposerAgentResponse(status="ℹ️ Skipped", details="Decomposition not deemed necessary.", time_taken=0.0)


        # 4. Refiner Agent
        refiner_start_time = time.time()
        generated_sql, refiner_time = RefinerAgent.generate_sql(query_for_agents, db_schema_string, app_state["last_decomposition"]) # Assuming external agent
        app_state["last_sql_generated"] = generated_sql
        sql_query_final = generated_sql # for response
        refiner_status = "✅ SQL generated"
        formatted_sql = generated_sql
        if not generated_sql or "Error" in generated_sql or "SELECT" not in generated_sql.upper(): # Basic check
            refiner_status = "❌ SQL generation failed or invalid"
        else:
            try:
                formatted_sql = sqlparse.format(generated_sql, reindent=True, keyword_case='upper')
            except Exception:
                formatted_sql = generated_sql # Keep original if formatting fails

        step4 = _add_processing_step(app_state, "Refiner Agent", refiner_status, formatted_sql, refiner_time)
        app_state["last_refiner_agent_run"] = RefinerAgentResponse(status=step4.status, details=formatted_sql if refiner_status == "✅ SQL generated" else generated_sql, time_taken=step4.time_taken)
        if refiner_status != "✅ SQL generated":
            raise ValueError(f"SQL generation failed: {generated_sql}")

        # 5. Database Execution
        db_exec_start_time = time.time()
        result_df = None
        db_exec_status = "❓"
        db_exec_details = ""
        try:
            result_df = execute_sql_query_db(sql_query_final) # Assuming external database function
            if result_df is None: # Indicates an execution failure or explicit None return
                db_exec_status = "❌ Query execution failed or returned no data structure"
                db_exec_details = "Execution resulted in None. Check DB logs or SQL syntax."
                app_state["last_result_df"] = None
                result_data_final = [] # Ensure result_data_final is an empty list on no data
                raise ValueError(db_exec_details) # Critical failure
            elif result_df.empty:
                db_exec_status = "✅ Query executed successfully (No Results)"
                db_exec_details = f"Query returned 0 rows and {len(result_df.columns)} columns."
                app_state["last_result_df"] = result_df
                result_data_final = []
            else:
                db_exec_status = "✅ Query executed successfully"
                db_exec_details = f"Query returned {len(result_df)} rows and {len(result_df.columns)} columns."
                app_state["last_result_df"] = result_df
                result_data_final = result_df.to_dict(orient="records")
        except Exception as db_err: # Catch errors from execute_sql_query_db
            db_exec_status = "❌ Query execution error"
            db_exec_details = f"Error during SQL execution: {db_err}"
            app_state["last_result_df"] = None
            result_data_final = [] # Ensure result_data_final is an empty list on error
            raise ValueError(db_exec_details) # Re-raise as critical failure for this process
        finally:
            db_exec_time = time.time() - db_exec_start_time
            step5 = _add_processing_step(app_state, "Database Execution", db_exec_status, db_exec_details, db_exec_time)
            app_state["last_db_execution_run"] = DatabaseExecutionResponse(
                status=step5.status, details=step5.details, result_data=result_data_final, time_taken=step5.time_taken
            )

        # 6. Visualization Agent
        vis_start_time = time.time()
        if app_state["last_result_df"] is not None and not app_state["last_result_df"].empty:
            suggested_vis, vis_time, summary_insights_eng, detailed_data_insights_eng = VisualizationAgent.suggest_visualization(query_for_agents, app_state["last_result_df"]) # Assuming external agent

            # Store English versions
            app_state["current_summary_insights_eng"] = summary_insights_eng
            app_state["current_data_insights_eng"] = detailed_data_insights_eng

            # Translate insights back to Arabic if the original query was Arabic
            summary_insights_ar = await translate_text_to_ar(summary_insights_eng) # Assuming external translation function
            data_insights_ar = await translate_text_to_ar(detailed_data_insights_eng) # Assuming external translation function
            app_state["current_summary_insights_ar"] = summary_insights_ar
            app_state["current_data_insights_ar"] = data_insights_ar

            # Set final insights based on original query language
            summary_insights_final = app_state["current_summary_insights_ar"] if lang == 'arabic' else app_state["current_summary_insights_eng"]
            data_insights_final = app_state["current_data_insights_ar"] if lang == 'arabic' else app_state["current_data_insights_eng"]

            app_state["last_suggested_visualization"] = suggested_vis

            suggested_visualization_final = suggested_vis

            vis_status = "✅ Visualization suggested with insights"
            vis_details = f"Suggested: `{suggested_vis}`. Summary: {summary_insights_final[:100]}..." if summary_insights_final else f"Suggested: `{suggested_vis}`."
            step6 = _add_processing_step(app_state, "Visualization Agent", vis_status, vis_details, vis_time)
            app_state["last_visualization_agent_run"] = VisualizationAgentResponse(
                status=step6.status, details=suggested_vis, insights=summary_insights_final, data_insights=data_insights_final, time_taken=step6.time_taken
            )
        else:
            _add_processing_step(app_state, "Visualization Agent", "ℹ️ Skipped", "No data or empty data from DB execution.", 0.0)
            app_state["last_visualization_agent_run"] = VisualizationAgentResponse(
                status="ℹ️ Skipped", details="No data for visualization.", insights=None, data_insights=None, time_taken=0.0
            )
            suggested_visualization_final = "Table" # Default
            summary_insights_final = "No data to analyze for summary insights."
            data_insights_final = "No data to analyze for detailed insights."


    except ValueError as ve: # Catch specific ValueErrors raised in the flow
        error_final = str(ve)
        # The step causing the error should already be in processing_steps
        # Add a final overall error step if not already covered by a specific agent's failure step
        if not any(step.status.startswith("❌") for step in app_state["processing_steps"]):
             _add_processing_step(app_state, "Overall Process", "❌ Failed to process query", error_final, time.time() - overall_start_time)
    except Exception as e:
        error_final = f"An unexpected error occurred: {e}"
        _add_processing_step(app_state, "Overall Process", "❌ Critical failure in query processing", error_final, time.time() - overall_start_time)


    overall_time_seconds = time.time() - overall_start_time

    return QueryProcessResponse(
        original_query=original_query, # User's original query (English or Arabic)
        sql_query=sql_query_final,
        result_data=result_data_final,
        suggested_visualization=suggested_visualization_final,
        summary_insights=summary_insights_final, # Return summary insights (translated if needed)
        data_insights=data_insights_final,    # Return detailed data insights (translated if needed)
        processing_steps=app_state["processing_steps"],
        total_time_seconds=overall_time_seconds,
        error=error_final
    )

# --- GET Endpoints to retrieve last known state of agents ---

@router.get("/selector-agent", summary="Get Last Selector Agent Result", response_model=SelectorAgentResponse)
async def get_selector_agent_result():
    """
    Retrieves the results from the last Selector Agent execution via /query-process.
    """
    if app_state["last_selector_agent_run"] is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selector Agent has not been run yet via /query-process.")
    return app_state["last_selector_agent_run"]

@router.get("/decomposer-agent", summary="Get Last Decomposer Agent Result", response_model=DecomposerAgentResponse)
async def get_decomposer_agent_result():
    """
    Retrieves the results from the last Decomposer Agent execution via /query-process.
    """
    if app_state["last_decomposer_agent_run"] is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Decomposer Agent has not been run or was skipped in the last /query-process.")
    return app_state["last_decomposer_agent_run"]

@router.get("/refiner-agent", summary="Get Last Refiner Agent Result", response_model=RefinerAgentResponse)
async def get_refiner_agent_result():
    """
    Retrieves the SQL query generated by the last Refiner Agent execution via /query-process.
    """
    if app_state["last_refiner_agent_run"] is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refiner Agent has not been run yet via /query-process.")
    return app_state["last_refiner_agent_run"]

@router.get("/database-execution", summary="Get Last Database Execution Result", response_model=DatabaseExecutionResponse)
async def get_database_execution_result():
    """
    Retrieves the results from the last database query execution via /query-process.
    """
    if app_state["last_db_execution_run"] is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Database execution has not occurred yet via /query-process.")
    return app_state["last_db_execution_run"]

@router.get("/visualization-agent", summary="Get Last Visualization Suggestion", response_model=VisualizationAgentResponse)
async def get_visualization_agent_result():
    """
    Retrieves the last visualization suggestion, summary insights, and detailed data insights from /query-process.
    """
    if app_state["last_visualization_agent_run"] is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visualization Agent has not been run or was skipped in the last /query-process.")
    return app_state["last_visualization_agent_run"]
