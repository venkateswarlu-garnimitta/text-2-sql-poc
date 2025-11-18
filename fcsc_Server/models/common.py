from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- Pydantic Models for Request/Response Bodies (Common) ---

class QueryInput(BaseModel):
    """
    Represents the input structure for a natural language query.
    """
    query: str

class AgentStep(BaseModel):
    """
    Represents a single step in the query processing pipeline,
    including details about the agent, its status, and time taken.
    """
    agent: str
    status: str
    details: str | dict | list | None # Made more generic for various outputs
    time_taken: float

class QueryProcessResponse(BaseModel):
    """
    Represents the comprehensive response from the /query-process endpoint,
    detailing the entire natural language to SQL conversion and execution flow.
    """
    original_query: str # User's original query (could be Arabic)
    sql_query: str | None
    result_data: list[dict] | None
    suggested_visualization: str | None
    summary_insights: str | None # Renamed for clarity, will be in Arabic if original query was Arabic
    data_insights: str | None    # Added new field, will be in Arabic if original query was Arabic
    processing_steps: list[AgentStep] # Use AgentStep model here
    total_time_seconds: float
    error: str | None
