import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  useToast,
  VStack,
  Image,
  Flex,
  ScaleFade,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
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

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

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
    <Box 
      minH="100vh" 
      bg="white" 
      backgroundImage="linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(240,240,255,0.5) 100%)"
    >
      <Container maxW="container.lg" py={20}>
        <VStack spacing={12} align="center">
          {/* Header Section */}
          <VStack spacing={6} textAlign="center">
            <Heading 
              size="2xl" 
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Comedy Chat
            </Heading>
            <Text 
              fontSize="xl" 
              color="gray.600" 
              maxW="600px"
              lineHeight="tall"
            >
              Experience hilarious conversations between our AI comedians. Watch as they riff off each other, 
              creating an endless stream of witty banter and clever callbacks.
            </Text>
          </VStack>

          {/* Character Showcase */}
          <Flex 
            gap={10} 
            justify="center" 
            align="center" 
            w="full"
            flexWrap={{ base: "wrap", md: "nowrap" }}
          >
            {/* Joe's Card */}
            <ScaleFade in={true} initialScale={0.9}>
              <Box
                bg="white"
                p={8}
                borderRadius="2xl"
                boxShadow="xl"
                textAlign="center"
                maxW="350px"
                animation={`${float} 3s ease-in-out infinite`}
                transition="all 0.3s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                <Image
                  src="/boy1.jpg"
                  alt="Joe"
                  w="200px"
                  h="200px"
                  objectFit="cover"
                  borderRadius="full"
                  mx="auto"
                  mb={6}
                  border="4px solid"
                  borderColor="yellow.400"
                />
                <Heading size="lg" mb={3} color="gray.800">
                  Joe
                </Heading>
                <Text color="gray.600" fontSize="md">
                  The improv master who turns everyday observations into comedy gold. 
                  Quick with callbacks and always ready with a witty response.
                </Text>
              </Box>
            </ScaleFade>

            {/* Cathy's Card */}
            <ScaleFade in={true} initialScale={0.9} delay={0.2}>
              <Box
                bg="white"
                p={8}
                borderRadius="2xl"
                boxShadow="xl"
                textAlign="center"
                maxW="350px"
                animation={`${float} 3s ease-in-out infinite 1.5s`}
                transition="all 0.3s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                <Image
                  src="/boy2.jpg"
                  alt="Cathy"
                  w="200px"
                  h="200px"
                  objectFit="cover"
                  borderRadius="full"
                  mx="auto"
                  mb={6}
                  border="4px solid"
                  borderColor="purple.400"
                />
                <Heading size="lg" mb={3} color="gray.800">
                  Cathy
                </Heading>
                <Text color="gray.600" fontSize="md">
                  A stand-up sensation with razor-sharp wit and perfect timing. 
                  Her observational humor will have you in stitches.
                </Text>
              </Box>
            </ScaleFade>
          </Flex>

          {/* Call to Action */}
          <Box textAlign="center" pt={8}>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={handleCreateSession}
              isLoading={isLoading}
              loadingText="Creating Session..."
              px={12}
              py={7}
              fontSize="xl"
              borderRadius="full"
              bgGradient="linear(to-r, blue.400, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.500, purple.600)",
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.2s"
            >
              Start Chatting
            </Button>
            <Text mt={4} color="gray.500" fontSize="sm">
              Join the fun and experience AI comedy at its finest!
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default HomePage; 