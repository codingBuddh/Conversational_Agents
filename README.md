# Comedy Agents: AI-Powered Comedy Chat Platform 🎭

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991.svg?logo=openai)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Comedy Agents is an innovative chat platform that brings together AI-powered comedic agents for interactive, entertaining conversations. Experience real-time, character-by-character streaming of witty banter between AI comedians.

## 🌟 Features

- **Real-time Comedy Interaction**: Engage with AI comedians in real-time conversations
- **Character Streaming**: Experience responses character-by-character for natural conversation flow
- **Multiple Comedy Agents**: Interact with different AI personalities:
  - Cathy: A witty stand-up comedian
  - Joe: An improvisational comedy expert
- **Modern Tech Stack**: Built with FastAPI, React, TypeScript, and OpenAI's GPT models
- **WebSocket Integration**: Smooth, real-time communication between client and server
- **Responsive Design**: Beautiful UI that works across devices

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/comedy-agents.git
   cd comedy-agents
   ```

2. Set up Python virtual environment:
   ```bash
   python -m venv ConvAgent
   source ConvAgent/bin/activate  # On Windows: ConvAgent\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other settings
   ```

5. Run the backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
comedy-agents/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core configurations
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic
│   │   └── main.py       # Application entry point
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── services/     # API services
    │   ├── types/        # TypeScript types
    │   └── pages/        # Page components
    └── package.json
```

## 🔧 Technical Details

### Backend Architecture

- **FastAPI**: High-performance async web framework
- **WebSocket**: Real-time communication for streaming responses
- **OpenAI Integration**: GPT-3.5-turbo for generating comedic responses
- **Pydantic Models**: Type-safe data validation
- **Async/Await**: Non-blocking I/O operations

### Frontend Architecture

- **React**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **Chakra UI**: Modern component library
- **WebSocket Client**: Real-time message streaming
- **React Router**: Client-side routing

## 🎯 Key Features Explained

### 1. Real-time Character Streaming
- WebSocket connection for instant response streaming
- Character-by-character display for natural conversation flow
- Visual typing indicators for active agents

### 2. AI Comedy Agents
- Distinct personality profiles for each agent
- Context-aware responses with callback humor
- Memory of previous interactions for contextual comedy

### 3. Modern UI/UX
- Responsive design for all devices
- Smooth animations and transitions
- Clear visual hierarchy and user feedback

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their powerful GPT models
- FastAPI for the excellent web framework
- React team for the frontend framework
- All contributors and supporters

## 📬 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Project Link: [https://github.com/yourusername/comedy-agents](https://github.com/yourusername/comedy-agents)

---

<p align="center">Made with ❤️ for the love of comedy and AI</p>

Keywords: AI Comedy, Conversational AI, Real-time Chat, WebSocket, FastAPI, React, TypeScript, OpenAI, GPT-3.5, Character Streaming, Comedy Agents, Interactive AI, Natural Language Processing, Chatbot, Entertainment AI

