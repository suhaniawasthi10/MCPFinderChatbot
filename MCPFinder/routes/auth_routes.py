from fastapi import APIRouter, Depends
from database import get_database
from models.auth import SignupRequest, LoginRequest
from controllers.auth_controller import AuthController

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup")
async def signup(request: SignupRequest, db = Depends(get_database)):
    return await AuthController.signup(request, db)

@router.post("/login")
async def login(request: LoginRequest, db = Depends(get_database)):
    return await AuthController.login(request, db)
