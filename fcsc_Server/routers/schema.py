from fastapi import APIRouter, HTTPException, status
from models.agents import SchemaLoaderResponse
from main import app_state # Import the global app_state

router = APIRouter(
    prefix="/schema",
    tags=['Schema_Loader']
)

@router.get("", summary="Get Last Loaded Database Schema", response_model=SchemaLoaderResponse)
async def get_db_schema_state():
    """
    Retrieves the state of the last schema loading attempt (e.g., from startup or /query-process).
    Does not actively reload the schema here; use /query-process to refresh.
    """
    if app_state["last_schema_loader_run"]:
        return app_state["last_schema_loader_run"]
    elif app_state["db_schema_string"]: # Fallback if only db_schema_string is set somehow
         return SchemaLoaderResponse(
            status="✅ Schema available (potentially from initial load)",
            details="Displaying cached schema string.",
            schema_content=app_state["db_schema_string"],
            time_taken=0 # Time taken here is for retrieval, not loading
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schema has not been loaded yet. Trigger a process that loads it, like /query-process or restart the app.")
