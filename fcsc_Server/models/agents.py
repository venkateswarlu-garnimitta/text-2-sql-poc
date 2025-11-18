from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- Pydantic Models for Agent-Specific Responses ---

class SchemaLoaderResponse(BaseModel):
    """
    Response model for the Schema Loader Agent, detailing schema loading status.
    """
    agent: str = "Schema Loader"
    status: str
    details: str | dict | None
    schema_content: str | None # Specific for schema
    time_taken: float | None

class SelectorAgentResponse(BaseModel):
    """
    Response model for the Selector Agent, indicating if a query is answerable.
    """
    agent: str = "Selector Agent"
    status: str
    details: dict | str | None
    time_taken: float | None

class DecomposerAgentResponse(BaseModel):
    """
    Response model for the Decomposer Agent, detailing query decomposition.
    """
    agent: str = "Decomposer Agent"
    status: str
    details: dict | str | list | None # Decomposition can be a list or structured dict
    time_taken: float | None

class RefinerAgentResponse(BaseModel):
    """
    Response model for the Refiner Agent, containing the generated SQL query.
    """
    agent: str = "Refiner Agent"
    status: str
    details: str | None # SQL query string or error
    time_taken: float | None

class DatabaseExecutionResponse(BaseModel):
    """
    Response model for Database Execution, including query results.
    """
    agent: str = "Database Execution"
    status: str
    details: str | None
    result_data: list[dict] | None
    time_taken: float | None

class VisualizationAgentResponse(BaseModel):
    """
    Response model for the Visualization Agent, suggesting visualization types and insights.
    """
    agent: str = "Visualization Agent"
    status: str
    details: str | None # Suggested visualization type
    insights: str | None # This will be the summary insights
    data_insights: str | None # New field for detailed data insights
    time_taken: float | None
