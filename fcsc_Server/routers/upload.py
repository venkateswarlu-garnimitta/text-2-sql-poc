import time
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from io import StringIO
from typing import Dict, Any

from main import app_state # Import the global app_state
from agents.schema_loader_agent import SchemaLoaderAgent # Assuming this remains external
from fast_api_file_upload import insert_data, create_table_if_not_exists, clean_column_name # Assuming these remain external

router = APIRouter(
    prefix="/upload-csv",
    tags=['Upload-CSV']
)

@router.post("", summary="Upload CSV to Database", response_model=dict)
async def upload_csv_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to upload a CSV file, create a table in the database based on its content,
    and insert the data into the new table. The database schema is then reloaded.
    """
    overall_start_time = time.time()
    processing_steps_upload = [] # Local list for this endpoint's steps

    def _add_upload_step(agent_name: str, status_msg: str, details_msg: str | dict, time_taken_step: float):
        """Helper to add steps specifically for the upload process."""
        processing_steps_upload.append({
            "agent": agent_name, "status": status_msg, "details": details_msg, "time_taken": time_taken_step
        })

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are allowed.")

    table_name_raw = file.filename.replace(".csv", "")
    table_name = clean_column_name(table_name_raw)

    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode("utf-8")))

        # Check if table exists and handle accordingly
        table_was_created = False
        try:
            table_was_created = create_table_if_not_exists(df, table_name) # Assuming external function
            if table_was_created:
                _add_upload_step("Table Creation", "✅ Table ensured", f"Table '{table_name}' created.", time.time() - overall_start_time)
            else:
                _add_upload_step("Table Creation", "ℹ️ Table already exists", f"Table '{table_name}' already exists. Skipping creation and data insertion.", time.time() - overall_start_time)
                # If table already exists, return early with a specific message
                return {
                    "message": f"File '{file.filename}' corresponds to an existing table '{table_name}'. Data not inserted to avoid duplication.",
                    "table_name": table_name,
                    "rows_inserted": 0,
                    "total_time_seconds": time.time() - overall_start_time,
                    "processing_steps": processing_steps_upload
                }
        except Exception as cte:
            error_detail = f"Failed to create or verify table '{table_name}': {cte}"
            _add_upload_step("Table Creation", "❌ Table creation/verification failed", error_detail, time.time() - overall_start_time)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_detail)

        # Only insert data if the table was newly created
        if table_was_created:
            insert_data(df, table_name) # Assuming external function
            _add_upload_step("Data Insertion", "✅ Data inserted", f"{len(df)} rows inserted into '{table_name}'.", time.time() - overall_start_time)
        else:
            # This part will technically not be reached due to the early return above,
            # but it's good for logical completeness if the early return logic changes.
            _add_upload_step("Data Insertion", "ℹ️ Data insertion skipped", "Data not inserted as table already existed.", time.time() - overall_start_time)


        # Refresh schema in global app state to include the new table
        schema_refresh_start = time.time()
        schema_string, schema_time = SchemaLoaderAgent.load_schema_from_db() # Assuming external function
        app_state["db_schema_string"]=  schema_string # Update global state
        # Update last run details for the schema endpoint
        from models.agents import SchemaLoaderResponse
        app_state["last_schema_loader_run"]= SchemaLoaderResponse(
            status="✅ Schema reloaded after file upload",
            details="New table included.",
            schema_content=schema_string,
            time_taken=schema_time
        )
        _add_upload_step("Schema Refresh", "✅ Schema reloaded", "Schema updated to include new table.", schema_time)

        total_time = time.time() - overall_start_time
        return {
            "message": f"File '{file.filename}' processed. Data inserted into table '{table_name}'.",
            "table_name": table_name,
            "rows_inserted": len(df) if table_was_created else 0, # Report rows inserted only if new
            "total_time_seconds": total_time,
            "processing_steps": processing_steps_upload
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        time_taken = time.time() - overall_start_time
        error_msg = f"Failed to process file upload for '{file.filename}': {e}"
        _add_upload_step("File Upload", "❌ File upload failed", error_msg, time_taken)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail={"error": error_msg, "processing_steps": processing_steps_upload})
