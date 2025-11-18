from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional

from main import app_state # Import the global app_state

router = APIRouter(
    prefix="", # No prefix, as insights are top-level
    tags=['Insights']
)

@router.get("/summary-insights/{lang}", summary="Get Last Summary Insights")
async def get_summary_insights(lang: str = "eng"):
    """
    Retrieves the generated summary insights from the last successful query processing in the specified language.
    """
    if lang.lower() == "arabic":
        insights_to_return = app_state["current_summary_insights_ar"]
    else:
        insights_to_return = app_state["current_summary_insights_eng"]

    if insights_to_return is None and app_state["last_visualization_agent_run"] and app_state["last_visualization_agent_run"].insights:
         # Fallback if specific language insights somehow missed but last_visualization_agent_run has a version
        return {"summary_insights": app_state["last_visualization_agent_run"].insights}
    elif insights_to_return is not None:
        return {"summary_insights": insights_to_return}
    else:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No summary insights available. Run /query-process successfully first.")

@router.get("/data-insights/{lang}", summary="Get Last Detailed Data Insights")
async def get_detailed_data_insights(lang: str = "eng"):
    """
    Retrieves the generated detailed data insights (technical metadata) from the last successful query processing in the specified language.
    """
    if lang.lower() == "arabic":
        insights_to_return = app_state["current_data_insights_ar"]
    else:
        insights_to_return = app_state["current_data_insights_eng"]

    if insights_to_return is None and app_state["last_visualization_agent_run"] and app_state["last_visualization_agent_run"].data_insights:
        # Fallback if specific language insights somehow missed but last_visualization_agent_run has a version
        return {"data_insights": app_state["last_visualization_agent_run"].data_insights}
    elif insights_to_return is not None:
        return {"data_insights": insights_to_return}
    else:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No detailed data insights available. Run /query-process successfully first.")
