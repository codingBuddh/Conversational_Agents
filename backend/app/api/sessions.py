from fastapi import APIRouter, HTTPException, WebSocket
from ..models.schemas import ChatSession, ChatSessionCreate, ChatMessage
from ..services.agent_service import AgentService
from typing import List
import logging
import traceback
from uuid import UUID
import json
from fastapi import WebSocketDisconnect

# Create separate routers for HTTP and WebSocket endpoints
router = APIRouter()
ws_router = APIRouter()
agent_service = AgentService()
logger = logging.getLogger(__name__)

@router.post("/sessions", response_model=ChatSession)
async def create_session(session_create: ChatSessionCreate):
    try:
        return await agent_service.create_session(session_create)
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create session: {str(e)}"
        )

# Move WebSocket endpoint to ws_router with the full path
@ws_router.websocket("/api/sessions/{session_id}/ws")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    logger.info(f"WebSocket connection attempt for session {session_id}")
    connection_open = False
    try:
        # Validate session exists before accepting connection
        try:
            await agent_service.get_session(session_id)
        except KeyError:
            logger.error(f"Session {session_id} not found")
            await websocket.close(code=1008)  # Policy violation: invalid session
            return
        except Exception as e:
            logger.error(f"Error validating session: {str(e)}")
            await websocket.close(code=1011)  # Internal error
            return

        # Accept connection after validation
        await websocket.accept()
        connection_open = True
        logger.info(f"WebSocket connection accepted for session {session_id}")
        
        while True:
            # Wait for messages from the client
            logger.info("Waiting for message from client...")
            data = await websocket.receive_text()
            message_data = json.loads(data)
            logger.info(f"Received message: {message_data}")
            
            # Create ChatMessage from the received data
            message = ChatMessage(
                role="user",
                content=message_data["content"],
                timestamp=message_data.get("timestamp", None)
            )
            
            # Process the message and stream responses
            await agent_service.add_message_stream(session_id, message, websocket)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        logger.error(traceback.format_exc())
        if connection_open:
            try:
                await websocket.send_json({
                    "type": "error",
                    "error": str(e)
                })
            except Exception as send_error:
                logger.error(f"Error sending error message: {str(send_error)}")
    finally:
        if connection_open:
            logger.info(f"Closing WebSocket connection for session {session_id}")
            try:
                await websocket.close()
            except Exception as close_error:
                logger.error(f"Error closing WebSocket: {str(close_error)}")

@router.get("/sessions/{session_id}", response_model=ChatSession)
async def get_session(session_id: UUID):
    try:
        return await agent_service.get_session(str(session_id))
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found"
        )
    except Exception as e:
        logger.error(f"Error getting session: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get session: {str(e)}"
        ) 