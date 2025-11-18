from models.common import AgentStep
from typing import Dict, Any

def _add_processing_step(app_state: Dict[str, Any], agent_name: str, status: str, details: str | dict | list | None, time_taken: float):
    """
    Helper function to add a new step to the global processing_steps log.

    Args:
        app_state (Dict[str, Any]): The global application state dictionary.
        agent_name (str): The name of the agent or process.
        status (str): The status of the step (e.g., "✅ Success", "❌ Failed").
        details (str | dict | list | None): Detailed information about the step.
        time_taken (float): The time taken for this step in seconds.

    Returns:
        AgentStep: The created AgentStep object.
    """
    step = AgentStep(agent=agent_name, status=status, details=details, time_taken=time_taken)
    app_state["processing_steps"].append(step)
    return step # Return the created step for convenience
