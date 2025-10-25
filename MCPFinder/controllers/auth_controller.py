from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException
from datetime import datetime
from models.user import User
from models.auth import GoogleAuthRequest, AuthResponse
from utils.jwt_handler import create_access_token
from config import settings

class AuthController:
    @staticmethod
    async def google_login(auth_request: GoogleAuthRequest, db) -> AuthResponse:
        try:
            # Verify the Google token
            idinfo = google_id_token.verify_oauth2_token(
                auth_request.token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            google_id = idinfo['sub']
            email = idinfo['email']
            name = idinfo.get('name', email)
            picture = idinfo.get('picture')
            
            # Check if user exists
            user_doc = await db.users.find_one({"google_id": google_id}, {"_id": 0})
            
            if user_doc:
                if isinstance(user_doc['created_at'], str):
                    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
                user = User(**user_doc)
            else:
                # Create new user
                user = User(
                    google_id=google_id,
                    email=email,
                    name=name,
                    picture=picture
                )
                user_dict = user.model_dump()
                user_dict['created_at'] = user_dict['created_at'].isoformat()
                await db.users.insert_one(user_dict)
            
            # Create access token
            access_token = create_access_token({"user_id": user.id, "email": user.email})
            
            return AuthResponse(access_token=access_token, user=user)
        
        except ValueError as e:
            raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")