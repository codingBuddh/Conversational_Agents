import axios from 'axios';
import { ChatSession, ChatMessage, ChatSessionCreate } from '../types/api';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createSession = async (sessionData: ChatSessionCreate): Promise<ChatSession> => {
    const response = await api.post<ChatSession>('/sessions', sessionData);
    return response.data;
};

export const getSession = async (sessionId: string): Promise<ChatSession> => {
    const response = await api.get<ChatSession>(`/sessions/${sessionId}`);
    return response.data;
};

export const sendMessage = async (sessionId: string, message: ChatMessage): Promise<ChatMessage> => {
    const response = await api.post<ChatMessage>(`/sessions/${sessionId}/messages`, message);
    return response.data;
}; 