import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
      </Routes>
    </Box>
  )
}

export default App
