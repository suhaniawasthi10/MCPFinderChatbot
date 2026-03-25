# MCP Server Finder

An AI-powered chatbot that helps users discover and explore **MCP (Model Context Protocol)** servers and tools through natural conversation. Built with a FastAPI backend, React frontend, and powered by Groq's LLM inference.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

## Features

- **AI-Powered MCP Discovery** — Search and find publicly available MCP servers using natural language
- **Smart Recommendations** — Get context-aware suggestions based on your specific use case
- **Real-time Web Search** — Live SerpAPI integration to find the latest MCP servers and documentation
- **Streaming Responses** — Server-Sent Events (SSE) with live tool status indicators
- **Conversation History** — Persistent chat sessions stored in MongoDB
- **User Authentication** — Signup/login with username and password (JWT-based)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Radix UI, Shadcn/ui |
| **Backend** | FastAPI, Python, Uvicorn |
| **Database** | MongoDB Atlas (Motor async driver) |
| **LLM** | Groq API (LLaMA 3.3 70B) via LangChain |
| **Search** | SerpAPI |
| **Auth** | bcrypt + JWT |
| **Deployment** | DigitalOcean, PM2 |

## Project Structure

```
MCPFinderChatbot/
├── MCPFinder/                  # Backend
│   ├── server.py               # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   ├── database.py             # MongoDB connection
│   ├── controllers/
│   │   ├── auth_controller.py  # Signup/login logic
│   │   ├── chat_controller.py  # Chat streaming logic
│   │   └── conversation_controller.py
│   ├── models/
│   │   ├── user.py             # User schema
│   │   ├── auth.py             # Auth request/response models
│   │   ├── message.py          # Message schema
│   │   └── conversation.py     # Conversation schema
│   ├── routes/
│   │   ├── auth_routes.py      # /api/auth/*
│   │   ├── chat_routes.py      # /api/chat
│   │   └── conversation_routes.py # /api/conversations/*
│   ├── services/
│   │   └── llm_service.py      # LangChain agent with MCP search tools
│   └── utils/
│       ├── jwt_handler.py      # Token creation/verification
│       └── dependencies.py     # FastAPI auth dependency
├── MCPFinderFrontend/          # Frontend
│   ├── src/
│   │   ├── App.tsx             # Routes and app shell
│   │   ├── pages/
│   │   │   ├── HomePage.tsx    # Landing page
│   │   │   ├── LoginPage.tsx   # Login form
│   │   │   ├── SignupPage.tsx  # Signup form
│   │   │   └── ChatPage.tsx    # Main chat interface
│   │   └── components/ui/      # Shadcn/ui components
│   └── package.json
└── ecosystem.config.js         # PM2 deployment config
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Create a new account | No |
| `POST` | `/api/auth/login` | Login with username/password | No |
| `GET` | `/api/conversations` | List user's conversations | Yes |
| `POST` | `/api/conversations` | Create a new conversation | Yes |
| `GET` | `/api/conversations/:id` | Get conversation messages | Yes |
| `DELETE` | `/api/conversations/:id` | Delete a conversation | Yes |
| `POST` | `/api/chat` | Send message (SSE streaming) | Yes |
| `GET` | `/health` | Health check | No |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account
- [Groq API key](https://console.groq.com)
- [SerpAPI key](https://serpapi.com)

### Backend Setup

```bash
cd MCPFinder
cp env.example .env
# Fill in your environment variables in .env
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### Frontend Setup

```bash
cd MCPFinderFrontend
cp .env.example .env
# Set REACT_APP_BACKEND_URL in .env
npm install
npm start
```

### Environment Variables

**Backend** (`MCPFinder/.env`):

```env
MONGO_URL=mongodb+srv://...
DB_NAME=mcp_finder
xAI_KEY=your_groq_api_key
SERPAPI_KEY=your_serpapi_key
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`MCPFinderFrontend/.env`):

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## How It Works

1. User signs up or logs in with username/password
2. User asks a question about MCP servers in natural language
3. The LangChain agent decides which tools to invoke:
   - `search_mcp_servers` — Multi-query SerpAPI search with MCP-specific filters
   - `search_web` — General web search for broader context
4. Tool status is streamed to the frontend in real-time via SSE
5. The final AI response is displayed with a typing animation
6. Conversations and messages are persisted in MongoDB

## Deployment

Deployed on a **DigitalOcean** droplet using **PM2** as the process manager.

```bash
pm2 start ecosystem.config.js
```
