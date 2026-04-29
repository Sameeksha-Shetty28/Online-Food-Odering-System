from fastapi import APIRouter, Depends, status

from app.controllers.auth_controller import get_profile, login_user, register_user
from app.schemas.user_schema import UserLogin, UserRegister
from app.utils.jwt_handler import get_current_user


router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    return await register_user(user_data)


@router.post("/login")
async def login(login_data: UserLogin):
    return await login_user(login_data)


@router.get("/profile")
async def profile(current_user=Depends(get_current_user)):
    return await get_profile(current_user)

