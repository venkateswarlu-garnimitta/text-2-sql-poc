import time
from fastapi import FastAPI

# Import agents and database functions (assuming these are external and remain as is)
from agents.schema_loader_agent import SchemaLoaderAgent

from fastapi.middleware.cors import CORSMiddleware
# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# --- Global State Management ---
# This dictionary will hold the application's global state.
# It's defined here and passed/accessed by routers as needed.
app_state = {
    "db_schema_string": None,
    "last_query_processed": None, # This will store the original user query (English or Arabic)
    "last_query_processed_english": None, # This will store the English version of the query
    "last_query_processed_arabic": None, # This will store the Arabic version of the query (if applicable)
    "processing_steps": [], # Log of steps for the last /query-process

    # Detailed outputs from the last /query-process call for individual GET endpoints
    "last_schema_loader_run": None,
    "last_selector_agent_run": None,
    "last_decomposer_agent_run": None,
    "last_refiner_agent_run": None,
    "last_db_execution_run": None,
    "last_visualization_agent_run": None,

    # Key data pieces often referenced
    "last_sql_generated": None, # From Refiner
    "last_result_df": None,     # From DB Execution
    "current_summary_insights_eng": None, # English version of summary insights
    "current_summary_insights_ar": None, # Arabic version of summary insights
    "current_data_insights_eng": None,    # English version of detailed data insights
    "current_data_insights_ar": None,    # Arabic version of detailed data insights
    "last_suggested_visualization": "Table", # From Visualization
    "last_decomposition": None # From Decomposer (if run)
}

# --- FastAPI App Initialization ---
app = FastAPI(
    title="NL2SQL Assistant API",
    description="API for converting natural language queries to SQL and visualizing results.",
    version="1.0.1" # Incremented version
)

# --- CORS Middleware ---
# Allow requests from your frontend origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],
)
# --- Import and Include Routers ---
# Import the APIRouter instances from the new files
from routers import schema, upload, query_process, insights, downloads

# Include the routers in the main application
app.include_router(schema.router)
app.include_router(upload.router)
app.include_router(query_process.router)
app.include_router(insights.router)
app.include_router(downloads.router)


# --- Startup Event Handler ---
@app.on_event("startup")
async def load_initial_schema():
    """
    Loads the initial database schema when the FastAPI application starts up.
    This populates the 'db_schema_string' and 'last_schema_loader_run' in the global app_state.
    """
    print("Loading initial database schema...")
    start_time = time.time()
    try:
        # SchemaLoaderAgent is assumed to be an external dependency that remains as is.
        schema_string, time_taken = SchemaLoaderAgent.load_schema_from_db()
        app_state["db_schema_string"] = schema_string
        status_msg = "✅ Schema loaded successfully from database on startup."
        details = f"Schema loaded in {time_taken:.2f} seconds."
        print(details)
        print(f"Schema: {schema_string[:200]}...")
        # Populate the last_schema_loader_run for the /schema endpoint
        from models.agents import SchemaLoaderResponse
        app_state["last_schema_loader_run"] = SchemaLoaderResponse(
            status=status_msg, details=details, schema_content=schema_string, time_taken=time_taken
        )
    except Exception as e:
        error_msg = f"Error loading initial schema: {e}"
        print(error_msg)
        app_state["db_schema_string"] = error_msg # Store error in schema string itself
        from models.agents import SchemaLoaderResponse
        app_state["last_schema_loader_run"] = SchemaLoaderResponse(
            status="❌ Failed to load schema on startup", details=error_msg, schema_content=None, time_taken=time.time()-start_time
        )

# The rest of the endpoints are now defined in their respective router files.