from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import sessions
from .core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Both React and Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Expose headers needed for WebSocket
)

# Include routers - separate WebSocket routes
app.include_router(sessions.router, prefix="/api", tags=["api"])
app.include_router(sessions.ws_router, tags=["websocket"])  # WebSocket routes without prefix

@app.get("/")
async def root():
    return {"message": "Welcome to Comedy Agents API"} 