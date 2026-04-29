from fastapi import APIRouter, Body, Depends, Header, HTTPException, status

from app.controllers.admin_controller import get_all_users
from app.controllers.food_controller import create_food, delete_food, get_all_foods, update_food
from app.controllers.order_controller import get_all_orders
from app.schemas.food_schema import FoodCreate, FoodUpdate


ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin123"
ADMIN_TOKEN = "admin-token"

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def verify_admin_token(authorization: str | None = Header(default=None)):
    if authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token",
        )
    return True


@router.post("/login")
async def admin_login(credentials: dict = Body(...)):
    email = credentials.get("email", "").strip().lower()
    password = credentials.get("password", "").strip()

    if email != ADMIN_EMAIL or password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Admin Credentials",
        )

    return {"token": ADMIN_TOKEN}


@router.post("/foods", status_code=status.HTTP_201_CREATED)
async def admin_add_food(food_data: FoodCreate, _admin=Depends(verify_admin_token)):
    return await create_food(food_data)


@router.get("/foods")
async def admin_list_foods(_admin=Depends(verify_admin_token)):
    return await get_all_foods()


@router.put("/foods/{id}")
async def admin_update_food(id: str, food_data: FoodUpdate, _admin=Depends(verify_admin_token)):
    return await update_food(id, food_data)


@router.delete("/foods/{id}")
async def admin_delete_food(id: str, _admin=Depends(verify_admin_token)):
    return await delete_food(id)


@router.get("/orders")
async def admin_list_orders(_admin=Depends(verify_admin_token)):
    return await get_all_orders()


@router.get("/users")
async def admin_list_users(_admin=Depends(verify_admin_token)):
    return await get_all_users()
