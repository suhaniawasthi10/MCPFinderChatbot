from fastapi import APIRouter, Depends
from database import get_database
from models.auth import ChatRequest
from models.user import User
from utils.dependencies import get_current_user
from controllers.chat_controller import ChatController

router = APIRouter(tags=["chat"])
chat_controller = ChatController()

@router.post("/chat")
async def chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    return await chat_controller.chat(chat_request, current_user, db)