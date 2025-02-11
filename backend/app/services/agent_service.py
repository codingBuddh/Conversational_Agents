from openai import AsyncOpenAI
from ..core.config import get_settings
from ..models.schemas import Agent, AgentCreate, ChatMessage, ChatSession, ChatSessionCreate
from typing import List, Dict, Any, AsyncGenerator
import logging
import os
from datetime import datetime
import traceback
from fastapi import WebSocket

settings = get_settings()

class AgentService:
    def __init__(self):
        self.client = None
        self.logger = logging.getLogger(__name__)
        self.sessions: Dict[str, ChatSession] = {}  # In-memory storage
        self.initialize_openai()

    def initialize_openai(self):
        api_key = os.getenv('OPENAI_API_KEY') or settings.openai_api_key
        if not api_key or api_key == "default-key":
            self.logger.warning("OpenAI API key not found. Some features may not work.")
        else:
            self.client = AsyncOpenAI(api_key=api_key)

    async def create_session(self, session_create: ChatSessionCreate) -> ChatSession:
        # Create a new session
        session = ChatSession(
            agents=[],
            messages=[],
        )

        # Convert raw agent data to Agent objects
        if not session_create.agents:
            # Default agents if none provided
            default_agents = [
                AgentCreate(
                    name="Cathy",
                    system_message="You are Cathy, a witty stand-up comedian. You love making clever observations and telling jokes. Reference and build upon previous jokes in the conversation when appropriate.",
                    llm_config={"model": "gpt-3.5-turbo", "temperature": 0.8},
                    human_input_mode="NEVER"
                ),
                AgentCreate(
                    name="Joe",
                    system_message="You are Joe, an improvisational comedian. You excel at building on others' jokes and creating callbacks to previous punchlines. Always try to reference or build upon the previous joke.",
                    llm_config={"model": "gpt-3.5-turbo", "temperature": 0.9},
                    human_input_mode="NEVER"
                )
            ]
            session.agents = [Agent(**agent.dict()) for agent in default_agents]
        else:
            # Convert provided agent data to Agent objects
            session.agents = [Agent(**agent.dict()) for agent in session_create.agents]
        
        self.sessions[str(session.id)] = session
        return session

    async def get_session(self, session_id: str) -> ChatSession:
        if session_id not in self.sessions:
            raise KeyError(f"Session {session_id} not found")
        return self.sessions[session_id]

    async def add_message_stream(self, session_id: str, message: ChatMessage, websocket: WebSocket) -> None:
        try:
            session = await self.get_session(session_id)
            
            # Add user message to the session
            session.messages.append(message)
            
            # Get agents to respond in sequence
            for agent in session.agents:
                try:
                    self.logger.info(f"Generating streaming reply for agent {agent.name}")
                    
                    # Send agent start marker
                    await websocket.send_json({
                        "type": "agent_start",
                        "agent_name": agent.name
                    })
                    
                    # Generate and stream response
                    async for content_chunk in self.generate_reply_stream(agent, session.messages):
                        await websocket.send_json({
                            "type": "content",
                            "agent_name": agent.name,
                            "content": content_chunk
                        })
                    
                    # Collect full response for storage
                    full_response = await self.generate_reply(agent, session.messages)
                    
                    # Create agent response
                    agent_response = ChatMessage(
                        role="assistant",
                        content=full_response,
                        timestamp=datetime.utcnow(),
                        agent_name=agent.name
                    )
                    
                    # Add response to session and agent's memory
                    session.messages.append(agent_response)
                    agent.memory.append(full_response)
                    
                    # Send agent end marker
                    await websocket.send_json({
                        "type": "agent_end",
                        "agent_name": agent.name
                    })
                    
                except Exception as e:
                    self.logger.error(f"Error with agent {agent.name}: {str(e)}")
                    self.logger.error(traceback.format_exc())
                    await websocket.send_json({
                        "type": "error",
                        "agent_name": agent.name,
                        "error": str(e)
                    })
                    raise
            
        except Exception as e:
            self.logger.error(f"Error in add_message_stream: {str(e)}")
            self.logger.error(traceback.format_exc())
            await websocket.send_json({
                "type": "error",
                "error": str(e)
            })
            raise

    async def generate_reply_stream(self, agent: Agent, messages: List[ChatMessage]) -> AsyncGenerator[str, None]:
        try:
            if not self.client:
                raise ValueError("OpenAI client not initialized. Please check your API key.")
            
            # Prepare messages including system message and memory context
            chat_messages = [
                {"role": "system", "content": agent.system_message}
            ]
            
            # Add memory context if available
            if agent.memory:
                memory_context = f"Previous jokes and context: {' | '.join(agent.memory[-3:])}"
                chat_messages.append({"role": "system", "content": memory_context})
            
            # Add conversation history
            chat_messages.extend([
                {
                    "role": msg.role,
                    "content": f"({msg.agent_name if msg.agent_name else 'User'}): {msg.content}"
                }
                for msg in messages[-5:]
            ])
            
            self.logger.info(f"Starting streaming request to OpenAI for agent {agent.name}")
            stream = await self.client.chat.completions.create(
                model=agent.llm_config["model"],
                messages=chat_messages,
                temperature=agent.llm_config["temperature"],
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            
        except Exception as e:
            self.logger.error(f"Error in generate_reply_stream: {str(e)}")
            self.logger.error(traceback.format_exc())
            raise

    async def generate_reply(self, agent: Agent, messages: List[ChatMessage]) -> str:
        try:
            if not self.client:
                raise ValueError("OpenAI client not initialized. Please check your API key.")
            
            # Prepare messages including system message and memory context
            chat_messages = [
                {"role": "system", "content": agent.system_message}
            ]
            
            # Add memory context if available
            if agent.memory:
                memory_context = f"Previous jokes and context: {' | '.join(agent.memory[-3:])}"
                chat_messages.append({"role": "system", "content": memory_context})
            
            # Add conversation history
            chat_messages.extend([
                {
                    "role": msg.role,
                    "content": f"({msg.agent_name if msg.agent_name else 'User'}): {msg.content}"
                }
                for msg in messages[-5:]
            ])
            
            self.logger.info(f"Sending request to OpenAI for agent {agent.name}")
            response = await self.client.chat.completions.create(
                model=agent.llm_config["model"],
                messages=chat_messages,
                temperature=agent.llm_config["temperature"]
            )
            
            if not response.choices:
                raise ValueError("No response received from OpenAI")
                
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error in generate_reply: {str(e)}")
            self.logger.error(traceback.format_exc())
            raise 