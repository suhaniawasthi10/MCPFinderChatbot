from fastapi import APIRouter, Depends
from typing import List
from database import get_database
from models.conversation import Conversation, ConversationCreate
from models.message import Message
from models.user import User
from utils.dependencies import get_current_user
from controllers.conversation_controller import ConversationController

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.post("", response_model=Conversation)
async def create_conversation(
    conv_create: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    return await ConversationController.create_conversation(conv_create, current_user, db)

@router.get("", response_model=List[Conversation])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    return await ConversationController.get_conversations(current_user, db)

@router.get("/{conversation_id}", response_model=List[Message])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    return await ConversationController.get_conversation_messages(conversation_id, current_user, db)