from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import logging
from config import settings
from database import connect_to_mongo, close_mongo_connection
from routes import auth_routes, conversation_routes, chat_routes

# Create the main app
app = FastAPI(title="MCP Server Finder API", version="1.0.0")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "MCP Server Finder API is running"}

# Include all route modules
api_router.include_router(auth_routes.router)
api_router.include_router(conversation_routes.router)
api_router.include_router(chat_routes.router)

# Include the API router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Event handlers
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    logger.info("Application shutdown complete")