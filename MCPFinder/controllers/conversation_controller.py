from fastapi import HTTPException
from typing import List
from datetime import datetime
from models.conversation import Conversation, ConversationCreate
from models.message import Message
from models.user import User

class ConversationController:
    @staticmethod
    async def create_conversation(conv_create: ConversationCreate, current_user: User, db) -> Conversation:
        conversation = Conversation(
            user_id=current_user.id,
            title=conv_create.title
        )
        
        conv_dict = conversation.model_dump()
        conv_dict['created_at'] = conv_dict['created_at'].isoformat()
        conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
        
        await db.conversations.insert_one(conv_dict)
        return conversation
    
    @staticmethod
    async def get_conversations(current_user: User, db) -> List[Conversation]:
        conversations = await db.conversations.find(
            {"user_id": current_user.id},
            {"_id": 0}
        ).sort("updated_at", -1).to_list(1000)
        
        for conv in conversations:
            if isinstance(conv['created_at'], str):
                conv['created_at'] = datetime.fromisoformat(conv['created_at'])
            if isinstance(conv['updated_at'], str):
                conv['updated_at'] = datetime.fromisoformat(conv['updated_at'])
        
        return conversations
    
    @staticmethod
    async def get_conversation_messages(conversation_id: str, current_user: User, db) -> List[Message]:
        # Verify conversation belongs to user
        conversation = await db.conversations.find_one(
            {"id": conversation_id, "user_id": current_user.id},
            {"_id": 0}
        )
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        messages = await db.messages.find(
            {"conversation_id": conversation_id},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(1000)
        
        for msg in messages:
            if isinstance(msg['timestamp'], str):
                msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])

        return messages

    @staticmethod
    async def delete_conversation(conversation_id: str, current_user: User, db):
        # Verify conversation belongs to user
        conversation = await db.conversations.find_one(
            {"id": conversation_id, "user_id": current_user.id},
            {"_id": 0}
        )

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Delete all messages in the conversation
        await db.messages.delete_many({"conversation_id": conversation_id})

        # Delete the conversation
        await db.conversations.delete_one({"id": conversation_id, "user_id": current_user.id})

        return {"message": "Conversation deleted successfully"}