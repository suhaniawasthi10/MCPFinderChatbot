from fastapi import Header, HTTPException, Depends
from database import get_database
from utils.jwt_handler import verify_token
from models.user import User
from datetime import datetime

async def get_current_user(authorization: str = Header(None), db = Depends(get_database)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)