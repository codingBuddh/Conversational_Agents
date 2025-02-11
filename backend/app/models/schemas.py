from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4

class LLMConfig(BaseModel):
    model: str
    temperature: float = 0.7

class AgentCreate(BaseModel):
    name: str
    system_message: str
    llm_config: Dict[str, Any]
    human_input_mode: str

class Agent(AgentCreate):
    id: UUID = Field(default_factory=uuid4)
    memory: List[str] = []

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agent_name: Optional[str] = None

class ChatSessionCreate(BaseModel):
    agents: List[AgentCreate]

class ChatSession(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    agents: List[Agent]
    messages: List[ChatMessage] = []
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 