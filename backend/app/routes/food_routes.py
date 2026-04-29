from fastapi import APIRouter, Query, status

from app.controllers.food_controller import create_food, get_all_foods
from app.schemas.food_schema import FoodCreate


router = APIRouter(prefix="/api/foods", tags=["Foods"])


@router.get("")
async def list_foods(category: str | None = Query(default=None)):
    return await get_all_foods(category)


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_food(food_data: FoodCreate):
    return await create_food(food_data)
