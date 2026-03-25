from fastapi import HTTPException
from datetime import datetime
from models.user import User
from models.auth import SignupRequest, LoginRequest, AuthResponse
from utils.jwt_handler import create_access_token
import bcrypt

class AuthController:
    @staticmethod
    async def signup(request: SignupRequest, db) -> AuthResponse:
        # Check if username already taken
        existing = await db.users.find_one({"username": request.username}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Hash password
        password_hash = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Create user
        user = User(
            username=request.username,
            name=request.name,
            password_hash=password_hash
        )
        user_dict = user.model_dump()
        user_dict["password_hash"] = password_hash
        user_dict["created_at"] = user_dict["created_at"].isoformat()
        await db.users.insert_one(user_dict)

        # Create token
        access_token = create_access_token({"user_id": user.id, "username": user.username})

        return AuthResponse(
            access_token=access_token,
            user={"id": user.id, "username": user.username, "name": user.name}
        )

    @staticmethod
    async def login(request: LoginRequest, db) -> AuthResponse:
        # Find user
        user_doc = await db.users.find_one({"username": request.username}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # Verify password
        if not bcrypt.checkpw(request.password.encode("utf-8"), user_doc["password_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        if isinstance(user_doc["created_at"], str):
            user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])

        user = User(**user_doc)

        access_token = create_access_token({"user_id": user.id, "username": user.username})

        return AuthResponse(
            access_token=access_token,
            user={"id": user.id, "username": user.username, "name": user.name}
        )
