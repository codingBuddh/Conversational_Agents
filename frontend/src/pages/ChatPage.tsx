import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Input,
  Button,
  Text,
  useToast,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import { getSession } from '../services/api';
import { ChatSession, ChatMessage } from '../types/api';
import { ChatWebSocket } from '../services/websocket';

interface StreamingMessage {
  agentName: string;
  content: string;
  isComplete: boolean;
}

function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const toast = useToast();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<StreamingMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      // Initialize WebSocket
      wsRef.current = new ChatWebSocket(sessionId);
      wsRef.current.onMessage(handleWebSocketMessage);
      wsRef.current.onError(handleWebSocketError);

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, streamingMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSession = async () => {
    try {
      const data = await getSession(sessionId!);
      setSession(data);
    } catch (error: any) {
      toast({
        title: 'Error loading chat',
        description: error.response?.data?.detail || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'agent_start':
        setStreamingMessages(prev => [...prev, {
          agentName: data.agent_name,
          content: '',
          isComplete: false
        }]);
        break;

      case 'content':
        setStreamingMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.agentName === data.agent_name && !lastMessage.isComplete) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + data.content }
            ];
          }
          return prev;
        });
        break;

      case 'agent_end':
        setStreamingMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.agentName === data.agent_name) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, isComplete: true }
            ];
          }
          return prev;
        });
        fetchSession(); // Refresh the session to get the complete messages
        break;

      case 'error':
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        break;
    }
  };

  const handleWebSocketError = (error: any) => {
    toast({
      title: 'WebSocket Error',
      description: 'Connection error. Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !wsRef.current) return;

    try {
      setIsLoading(true);
      wsRef.current.sendMessage(message.trim());
      setMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageColor = (role: string, agentName?: string) => {
    if (role === 'user') return 'blue';
    if (agentName === 'Cathy') return 'pink';
    if (agentName === 'Joe') return 'green';
    return 'gray';
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Stack spacing={4} height="calc(100vh - 100px)">
        <Box flex="1" overflowY="auto" bg="white" p={4} borderRadius="md" boxShadow="sm">
          {/* Completed messages */}
          {session?.messages.map((msg, index) => (
            <Box
              key={index}
              mb={4}
              p={3}
              bg={`${getMessageColor(msg.role, msg.agent_name)}.50`}
              borderRadius="md"
              ml={msg.role === 'user' ? 'auto' : 0}
              mr={msg.role === 'assistant' ? 'auto' : 0}
              maxW="80%"
            >
              <Flex align="center" mb={2}>
                <Avatar 
                  size="sm" 
                  name={msg.agent_name || 'You'} 
                  bg={`${getMessageColor(msg.role, msg.agent_name)}.500`}
                  mr={2}
                />
                <Text fontWeight="bold" color={`${getMessageColor(msg.role, msg.agent_name)}.600`}>
                  {msg.agent_name || 'You'}
                </Text>
              </Flex>
              <Text>{msg.content}</Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>
          ))}

          {/* Streaming messages */}
          {streamingMessages.map((msg, index) => (
            <Box
              key={`streaming-${index}`}
              mb={4}
              p={3}
              bg={`${getMessageColor('assistant', msg.agentName)}.50`}
              borderRadius="md"
              mr="auto"
              maxW="80%"
              opacity={msg.isComplete ? 1 : 0.7}
            >
              <Flex align="center" mb={2}>
                <Avatar 
                  size="sm" 
                  name={msg.agentName} 
                  bg={`${getMessageColor('assistant', msg.agentName)}.500`}
                  mr={2}
                />
                <Text fontWeight="bold" color={`${getMessageColor('assistant', msg.agentName)}.600`}>
                  {msg.agentName}
                </Text>
              </Flex>
              <Text>{msg.content}</Text>
              {!msg.isComplete && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Typing...
                </Text>
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Flex>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            mr={2}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage();
              }
            }}
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            Send
          </Button>
        </Flex>
      </Stack>
    </Container>
  );
}

export default ChatPage; 