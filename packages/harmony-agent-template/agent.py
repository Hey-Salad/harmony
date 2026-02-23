"""
ADK Agent definition for Harmony.

Defines the root agent and optional sub-agents using Google ADK.
MCP tools are connected via FastMCP tool servers.
"""

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool


def get_current_time() -> dict:
    """Get the current UTC time."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    return {"time": now.isoformat(), "unix": int(now.timestamp())}


def search_products(query: str, max_results: int = 5) -> dict:
    """Search for products (example tool)."""
    return {
        "results": [
            {"name": f"Product {i}", "price": 9.99 + i, "query": query}
            for i in range(min(max_results, 5))
        ]
    }


# Sub-agents for specialized tasks
shopping_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="shopping_agent",
    instruction="You help users find and purchase products. Use search_products to find items.",
    tools=[FunctionTool(search_products)],
)

# Root orchestrator agent
root_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="harmony_agent",
    instruction=(
        "You are a Harmony AI assistant. You can help with shopping, "
        "scheduling, and general tasks. Delegate to specialized sub-agents "
        "when appropriate. Always be helpful and concise."
    ),
    tools=[FunctionTool(get_current_time)],
    sub_agents=[shopping_agent],
)
