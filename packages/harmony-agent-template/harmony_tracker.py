"""
Harmony runtime tracker for Python agents.

Wraps API calls to the Harmony backend for session tracking,
metric reporting, and cost calculation.
"""

import os
import time
import httpx
from typing import Optional


# Model pricing per 1M tokens
MODEL_PRICING = {
    "gemini-2.5-flash": {"input": 0.15, "output": 0.60},
    "gemini-2.5-pro": {"input": 1.25, "output": 10.00},
    "gemini-2.0-flash": {"input": 0.10, "output": 0.40},
    "claude-sonnet": {"input": 3.00, "output": 15.00},
    "claude-opus": {"input": 15.00, "output": 75.00},
    "claude-haiku": {"input": 0.25, "output": 1.25},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
}


def calculate_cost(model_name: str, tokens_input: int, tokens_output: int) -> float:
    """Calculate cost from token counts and model name."""
    normalized = model_name.lower().replace("_", "-").replace(" ", "-")
    for key, rates in MODEL_PRICING.items():
        if key in normalized:
            input_cost = (tokens_input / 1_000_000) * rates["input"]
            output_cost = (tokens_output / 1_000_000) * rates["output"]
            return input_cost + output_cost
    return 0.0


class HarmonyTracker:
    """Tracks agent runtime and reports to the Harmony API."""

    def __init__(
        self,
        agent_id: Optional[str] = None,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
    ):
        self.agent_id = agent_id or os.getenv("HARMONY_AGENT_ID", "")
        self.api_key = api_key or os.getenv("HARMONY_API_KEY", "")
        self.api_url = (api_url or os.getenv("HARMONY_API_URL", "")).rstrip("/")
        self.model_name = model_name
        self._client = httpx.AsyncClient(
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            timeout=10.0,
        )

    async def start_session(
        self, task_id: str, task_description: Optional[str] = None
    ) -> str:
        """Start a new work session. Returns session ID."""
        resp = await self._client.post(
            f"{self.api_url}/api/sessions/start",
            json={
                "worker_id": self.agent_id,
                "task_id": task_id,
                "task_description": task_description,
                "model_version": self.model_name,
            },
        )
        resp.raise_for_status()
        return resp.json()["session"]["id"]

    async def report_metrics(
        self,
        session_id: str,
        tokens_input: int = 0,
        tokens_output: int = 0,
        api_calls_count: int = 1,
        error_count: int = 0,
    ) -> None:
        """Report incremental metrics via heartbeat."""
        cost = calculate_cost(self.model_name, tokens_input, tokens_output)
        await self._client.post(
            f"{self.api_url}/api/sessions/{session_id}/heartbeat",
            json={
                "tokens_input": tokens_input,
                "tokens_output": tokens_output,
                "api_calls_count": api_calls_count,
                "cost_incurred": cost,
                "error_count": error_count,
            },
        )

    async def end_session(
        self,
        session_id: str,
        tokens_input: int = 0,
        tokens_output: int = 0,
        error_count: int = 0,
    ) -> None:
        """End a session with optional final metrics."""
        cost = calculate_cost(self.model_name, tokens_input, tokens_output)
        await self._client.post(
            f"{self.api_url}/api/sessions/{session_id}/end",
            json={
                "tokens_input": tokens_input,
                "tokens_output": tokens_output,
                "cost_incurred": cost,
                "error_count": error_count,
            },
        )

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()
