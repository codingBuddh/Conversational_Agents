import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useToast,
  VStack,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import { createSession } from '../services/api';
import { AgentCreate } from '../types/api';

const DEFAULT_AGENTS: AgentCreate[] = [
  {
    name: "Cathy",
    system_message: "You are Cathy, a witty stand-up comedian. You love making clever observations and telling jokes. Reference and build upon previous jokes in the conversation when appropriate.",
    llm_config: {
      model: "gpt-3.5-turbo",
      temperature: 0.8,
    },
    human_input_mode: "NEVER",
  },
  {
    name: "Joe",
    system_message: "You are Joe, an improvisational comedian. You excel at building on others' jokes and creating callbacks to previous punchlines. Always try to reference or build upon the previous joke.",
    llm_config: {
      model: "gpt-3.5-turbo",
      temperature: 0.9,
    },
    human_input_mode: "NEVER",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSession = async () => {
    try {
      setIsLoading(true);
      const session = await createSession({ agents: DEFAULT_AGENTS });
      navigate(`/chat/${session.id}`);
    } catch (error: any) {
      console.error('Error creating session:', error.response?.data || error);
      toast({
        title: 'Error creating session',
        description: error.response?.data?.detail || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="center">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Comedy Chat
          </Heading>
          <Text fontSize="xl" color="gray.600" mb={8}>
            Chat with our comedy duo and enjoy their witty banter
          </Text>
        </Box>

        <Stack direction="row" spacing={6} justify="center" mb={8}>
          {DEFAULT_AGENTS.map((agent, index) => (
            <Box
              key={index}
              p={4}
              bg="white"
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
            >
              <Avatar
                size="xl"
                name={agent.name}
                bg={agent.name === "Cathy" ? "pink.500" : "green.500"}
                mb={3}
              />
              <Text fontWeight="bold" fontSize="lg">
                {agent.name}
              </Text>
              <Text color="gray.600" fontSize="sm">
                {agent.name === "Cathy" ? "Witty Stand-up Comedian" : "Improvisational Comedian"}
              </Text>
            </Box>
          ))}
        </Stack>

        <Button
          size="lg"
          colorScheme="blue"
          onClick={handleCreateSession}
          disabled={isLoading}
          width="200px"
        >
          Start New Chat
        </Button>
      </VStack>
    </Container>
  );
}

export default HomePage; 