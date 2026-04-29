from fastapi import APIRouter, Body, status

from app.controllers.auth_controller import get_user_by_id, login_frontend_user, register_frontend_user


router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user_route(user_data: dict = Body(...)):
    return await register_frontend_user(user_data)


@router.post("/login")
async def login_user_route(login_data: dict = Body(...)):
    return await login_frontend_user(login_data)


@router.get("/{id}")
async def read_user_route(id: str):
    return await get_user_by_id(id)
