import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Input,
  Button,
  Text,
  useToast,
  Flex,
  Image,
  VStack,
  Container,
} from '@chakra-ui/react';
import { getSession } from '../services/api';
import { ChatSession, ChatMessage } from '../types/api';
import { ChatWebSocket } from '../services/websocket';

// Character images
const boy1Image = '/boy1.jpg';  // Joe's image
const boy2Image = '/boy2.jpg';  // Cathy's image

interface StreamingMessage {
  agentName: string;
  content: string;
  isComplete: boolean;
  id: string;  // Add unique ID for each message
}

interface ConversationMessage {
  agentName?: string;
  content: string;
  isComplete: boolean;
  timestamp: string;
  id?: string;  // Add optional ID for streaming messages
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
        const newMessageId = `${data.agent_name}-${Date.now()}`;
        setStreamingMessages(prev => {
          // Remove any existing incomplete messages from this agent
          const filtered = prev.filter(msg => 
            msg.agentName !== data.agent_name || msg.isComplete
          );
          
          return [...filtered, {
            agentName: data.agent_name,
            content: '',
            isComplete: false,
            id: newMessageId
          }];
        });
        break;

      case 'content':
        setStreamingMessages(prev => {
          const messageToUpdate = prev.find(msg => 
            msg.agentName === data.agent_name && !msg.isComplete
          );
          if (messageToUpdate) {
            return prev.map(msg =>
              msg.id === messageToUpdate.id
                ? { ...msg, content: msg.content + data.content }
                : msg
            );
          }
          return prev;
        });
        break;

      case 'agent_end':
        setStreamingMessages(prev => {
          const messageToComplete = prev.find(msg => 
            msg.agentName === data.agent_name && !msg.isComplete
          );
          if (messageToComplete) {
            return prev.map(msg =>
              msg.id === messageToComplete.id
                ? { ...msg, isComplete: true }
                : msg
            );
          }
          return prev;
        });
        setTimeout(() => {
          fetchSession();
        }, 500);
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

  const getAllMessages = (): ConversationMessage[] => {
    const completed = (session?.messages || [])
      .map(msg => ({
        agentName: msg.agent_name,
        content: msg.content,
        isComplete: true,
        timestamp: msg.timestamp,
        id: `${msg.agent_name}-${msg.timestamp}`
      }));

    const streaming = streamingMessages.map(msg => ({
      agentName: msg.agentName,
      content: msg.content,
      isComplete: msg.isComplete,
      timestamp: new Date().toISOString(),
      id: msg.id
    }));

    // Combine messages and remove duplicates
    const allMessages = [...completed, ...streaming];
    const uniqueMessages = allMessages.reduce((acc, current) => {
      const existingMessage = acc.find(msg => 
        msg.id === current.id || 
        (msg.agentName === current.agentName && 
         msg.content === current.content)
      );
      if (!existingMessage) {
        acc.push(current);
      }
      return acc;
    }, [] as ConversationMessage[]);

    return uniqueMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  return (
    <Box minH="100vh" bg="white" position="relative">
      {/* Main Content */}
      <Container maxW="container.xl" py={8} px={4}>
        <Flex gap={6} justify="center">
          {/* Conversation Area */}
          <Box 
            bg="white" 
            p={6} 
            borderRadius="xl" 
            boxShadow="sm"
            minH="calc(100vh - 200px)"
            maxH="calc(100vh - 200px)"
            overflowY="auto"
            mb={8}
            width="500px"
            ml="200px"
          >
            <VStack spacing={6} align="stretch">
              {getAllMessages().map((msg, index) => (
                msg.agentName && (
                  <Flex
                    key={msg.id || index}
                    justify={msg.agentName === 'Joe' ? 'flex-start' : 'flex-end'}
                    position="relative"
                    maxW="80%"
                    ml={msg.agentName === 'Joe' ? '0' : 'auto'}
                    mr={msg.agentName === 'Cathy' ? '0' : 'auto'}
                    opacity={msg.isComplete ? 1 : 0.7}
                    transition="opacity 0.3s ease-in-out"
                  >
                    <Box
                      bg={msg.agentName === 'Joe' ? 'yellow.50' : 'purple.50'}
                      p={4}
                      borderRadius="xl"
                      borderTopLeftRadius={msg.agentName === 'Joe' ? 0 : undefined}
                      borderTopRightRadius={msg.agentName === 'Cathy' ? 0 : undefined}
                      width="100%"
                      boxShadow="sm"
                      position="relative"
                    >
                      <Text fontSize="md">{msg.content}</Text>
                      {!msg.isComplete && (
                        <Flex align="center" mt={2}>
                          <Text 
                            fontSize="sm" 
                            color={msg.agentName === 'Joe' ? 'yellow.600' : 'purple.600'}
                            animation="pulse 1s infinite"
                          >
                            typing...
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                )
              ))}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* User Messages Area */}
          <Box
            width="300px"
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            minH="calc(100vh - 200px)"
            maxH="calc(100vh - 200px)"
            overflowY="auto"
            mb={8}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>Your Messages</Text>
            <VStack spacing={4} align="stretch">
              {getAllMessages().map((msg, index) => (
                !msg.agentName && (
                  <Box
                    key={index}
                    bg="blue.50"
                    p={4}
                    borderRadius="xl"
                    boxShadow="sm"
                  >
                    <Text fontSize="md">{msg.content}</Text>
                  </Box>
                )
              ))}
            </VStack>
          </Box>
        </Flex>

        {/* Character Images */}
        <Box position="fixed" bottom="150px" left="50px" width="300px" height="350px" zIndex={3}>
          <Image
            src={boy1Image}
            alt="Joe"
            w="100%"
            h="100%"
            objectFit="contain"
            opacity={1}
            transform="translateY(-50%)"
          />
        </Box>
        <Box position="fixed" bottom="150px" right="20px" width="300px" height="350px" zIndex={3}>
          <Image
            src={boy2Image}
            alt="Cathy"
            w="100%"
            h="100%"
            objectFit="contain"
            opacity={1}
            transform="translateY(-50%)"
          />
        </Box>

        {/* Input Area Container */}
        <Box 
          position="fixed" 
          bottom={0} 
          left={0}
          right={0}
          height="100px"
          bg="white" 
          boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
          zIndex={2}
        >
          {/* Input Area */}
          <Flex 
            maxW="600px" 
            width="100%" 
            mx="auto"
            height="100%"
            align="center"
            px={4}
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Give them a topic to discuss..."
              size="lg"
              bg="white"
              mr={4}
              borderRadius="xl"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage();
                }
              }}
            />
            <Button
              colorScheme="blue"
              onClick={handleSendMessage}
              isLoading={isLoading}
              size="lg"
              borderRadius="xl"
              px={8}
            >
              Send
            </Button>
          </Flex>
        </Box>

        {/* Spacer for fixed bottom input */}
        <Box h="100px" />
      </Container>

      {/* Add animation styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  );
}

export default ChatPage; 