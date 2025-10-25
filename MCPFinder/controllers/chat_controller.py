from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
import logging
import json
from typing import AsyncIterator
from models.auth import ChatRequest
from models.conversation import Conversation
from models.message import Message
from models.user import User
from services.llm_service import LLMService

logger = logging.getLogger(__name__)

class ChatController:
    def __init__(self):
        self.llm_service = LLMService()
    
    async def chat(self, chat_request: ChatRequest, current_user: User, db) -> StreamingResponse:
        try:
            # Get or create conversation
            conversation_id = chat_request.conversation_id
            
            if not conversation_id:
                conversation = Conversation(
                    user_id=current_user.id,
                    title=chat_request.message[:50]
                )
                conversation_id = conversation.id
                
                conv_dict = conversation.model_dump()
                conv_dict['created_at'] = conv_dict['created_at'].isoformat()
                conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
                
                await db.conversations.insert_one(conv_dict)
            else:
                # Verify conversation exists and belongs to user
                conversation = await db.conversations.find_one(
                    {"id": conversation_id, "user_id": current_user.id},
                    {"_id": 0}
                )
                if not conversation:
                    raise HTTPException(status_code=404, detail="Conversation not found")
            
            # Save user message
            user_message = Message(
                conversation_id=conversation_id,
                sender="user",
                content=chat_request.message
            )
            user_msg_dict = user_message.model_dump()
            user_msg_dict['timestamp'] = user_msg_dict['timestamp'].isoformat()
            await db.messages.insert_one(user_msg_dict)
            
            # Get conversation history (excluding just-added message)
            messages = await db.messages.find(
                {"conversation_id": conversation_id},
                {"_id": 0}
            ).sort("timestamp", 1).to_list(1000)
            
            # Remove the last message (just added user message) from history for context
            messages_history = messages[:-1] if len(messages) > 1 else []
            
            # Stream response with tool status updates
            async def generate_response() -> AsyncIterator[str]:
                try:
                    full_response = ""
                    
                    # Get response from LLM with tool status updates
                    async for event in self.llm_service.get_chat_response_with_status(messages_history, chat_request.message):
                        if event["type"] == "tool_start":
                            # Send tool start event
                            yield f"data: {json.dumps({'type': 'tool_start', 'tool': event['tool']})}\n\n"
                        elif event["type"] == "tool_end":
                            # Send tool end event
                            yield f"data: {json.dumps({'type': 'tool_end', 'tool': event['tool']})}\n\n"
                        elif event["type"] == "response":
                            # Final response
                            full_response = event["content"]
                    
                    # Save AI response
                    ai_message = Message(
                        conversation_id=conversation_id,
                        sender="ai",
                        content=full_response
                    )
                    ai_msg_dict = ai_message.model_dump()
                    ai_msg_dict['timestamp'] = ai_msg_dict['timestamp'].isoformat()
                    await db.messages.insert_one(ai_msg_dict)
                    
                    # Update conversation timestamp
                    await db.conversations.update_one(
                        {"id": conversation_id},
                        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
                    )
                    
                    logger.info(f"Message saved to database for conversation {conversation_id}")
                    
                    # Send final response
                    yield f"data: {json.dumps({'type': 'response', 'content': full_response, 'conversation_id': conversation_id})}\n\n"
                    
                except Exception as e:
                    logger.error(f"Error generating response: {str(e)}")
                    yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            
            return StreamingResponse(
                generate_response(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no"
                }
            )
        
        except Exception as e:
            logger.error(f"Error in chat endpoint: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))