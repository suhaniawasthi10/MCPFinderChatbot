from fastapi import APIRouter, Depends
from database import get_database
from models.auth import GoogleAuthRequest, AuthResponse
from controllers.auth_controller import AuthController

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/google")
async def google_auth(auth_request: GoogleAuthRequest, db = Depends(get_database)):
    result = await AuthController.google_login(auth_request, db)
    # Explicit serialization to ensure datetime is properly converted
    return {
        "access_token": result.access_token,
        "user": {
            "id": result.user.id,
            "google_id": result.user.google_id,
            "email": result.user.email,
            "name": result.user.name,
            "picture": result.user.picture,
            "created_at": result.user.created_at.isoformat()
        }
    }