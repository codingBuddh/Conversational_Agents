// import { UUID } from 'crypto';

export interface LLMConfig {
    model: string;
    temperature: number;
}

export interface AgentCreate {
    name: string;
    system_message: string;
    llm_config: LLMConfig;
    human_input_mode: string;
}

export interface Agent extends AgentCreate {
    id: string;
    memory: string[];
}

export interface ChatMessage {
    role: string;
    content: string;
    timestamp: string;
    agent_name?: string;
}

export interface ChatSession {
    id: string;
    agents: Agent[];
    messages: ChatMessage[];
    summary?: string;
    created_at: string;
    updated_at: string;
}

export interface ChatSessionCreate {
    agents: AgentCreate[];
} 