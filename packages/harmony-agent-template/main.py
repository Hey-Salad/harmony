"""
FastAPI + WebSocket server for ADK bidi-streaming agent with Harmony tracking.

Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import asyncio
import os
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from google.adk.runner import Runner
from google.adk.sessions import InMemorySessionService

from agent import root_agent
from harmony_tracker import HarmonyTracker

app = FastAPI(title="Harmony Agent")

# ADK session service
session_service = InMemorySessionService()

# ADK runner
runner = Runner(
    agent=root_agent,
    app_name="harmony-agent",
    session_service=session_service,
)

# Harmony tracker
tracker = HarmonyTracker(model_name="gemini-2.5-flash")


@app.get("/health")
async def health():
    return {"status": "healthy", "agent": root_agent.name}


@app.websocket("/ws/{task_id}")
async def websocket_agent(websocket: WebSocket, task_id: str):
    """
    Bidi-streaming WebSocket endpoint.

    Client sends user messages, server streams agent responses.
    All runtime metrics are automatically tracked in Harmony.
    """
    await websocket.accept()

    # Create ADK session
    user_id = f"user-{uuid.uuid4().hex[:8]}"
    adk_session = await session_service.create_session(
        app_name="harmony-agent",
        user_id=user_id,
    )

    # Start Harmony tracking session
    harmony_session_id = None
    try:
        harmony_session_id = await tracker.start_session(
            task_id=task_id,
            task_description=f"WebSocket session for task {task_id}",
        )
    except Exception as e:
        print(f"[Harmony] Failed to start tracking session: {e}")

    total_errors = 0

    try:
        while True:
            # Receive user message
            data = await websocket.receive_text()

            # Create ADK content
            from google.genai import types
            content = types.Content(
                role="user",
                parts=[types.Part(text=data)],
            )

            # Run agent and stream events
            async for event in runner.run_async(
                user_id=user_id,
                session_id=adk_session.id,
                new_message=content,
            ):
                # Track token usage from ADK events
                if harmony_session_id and hasattr(event, "usage_metadata") and event.usage_metadata:
                    try:
                        await tracker.report_metrics(
                            session_id=harmony_session_id,
                            tokens_input=getattr(event.usage_metadata, "prompt_token_count", 0) or 0,
                            tokens_output=getattr(event.usage_metadata, "candidates_token_count", 0) or 0,
                        )
                    except Exception as e:
                        print(f"[Harmony] Metrics report failed: {e}")

                # Send event to client
                if hasattr(event, "content") and event.content and event.content.parts:
                    for part in event.content.parts:
                        if hasattr(part, "text") and part.text:
                            await websocket.send_json({
                                "type": "text",
                                "content": part.text,
                                "agent": getattr(event, "author", root_agent.name),
                            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        total_errors += 1
        print(f"[Agent] Error: {e}")
    finally:
        # End Harmony tracking session
        if harmony_session_id:
            try:
                await tracker.end_session(
                    session_id=harmony_session_id,
                    error_count=total_errors,
                )
            except Exception as e:
                print(f"[Harmony] Failed to end session: {e}")


@app.post("/run/{task_id}")
async def run_task(task_id: str, message: dict):
    """
    Simple REST endpoint for one-shot agent tasks.
    Tracks the full execution as a single Harmony session.
    """
    user_id = f"user-{uuid.uuid4().hex[:8]}"
    adk_session = await session_service.create_session(
        app_name="harmony-agent",
        user_id=user_id,
    )

    harmony_session_id = None
    try:
        harmony_session_id = await tracker.start_session(
            task_id=task_id,
            task_description=message.get("description", f"REST task {task_id}"),
        )
    except Exception as e:
        print(f"[Harmony] Failed to start tracking: {e}")

    from google.genai import types
    content = types.Content(
        role="user",
        parts=[types.Part(text=message.get("text", ""))],
    )

    responses = []
    errors = 0

    try:
        async for event in runner.run_async(
            user_id=user_id,
            session_id=adk_session.id,
            new_message=content,
        ):
            if harmony_session_id and hasattr(event, "usage_metadata") and event.usage_metadata:
                try:
                    await tracker.report_metrics(
                        session_id=harmony_session_id,
                        tokens_input=getattr(event.usage_metadata, "prompt_token_count", 0) or 0,
                        tokens_output=getattr(event.usage_metadata, "candidates_token_count", 0) or 0,
                    )
                except Exception:
                    pass

            if hasattr(event, "content") and event.content and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        responses.append(part.text)
    except Exception as e:
        errors += 1
        responses.append(f"Error: {str(e)}")
    finally:
        if harmony_session_id:
            try:
                await tracker.end_session(harmony_session_id, error_count=errors)
            except Exception:
                pass

    return {"task_id": task_id, "response": "\n".join(responses), "errors": errors}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
