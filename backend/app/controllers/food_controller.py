from bson import ObjectId
from fastapi import HTTPException, status

from app.config.db import foods_collection
from app.models.food_model import food_document, food_response
from app.schemas.food_schema import FoodCreate, FoodUpdate


async def get_all_foods(category: str | None = None):
    query = {"category": category} if category else {}
    foods = [food_response(food) for food in foods_collection.find(query).sort("createdAt", -1)]
    return {"count": len(foods), "foods": foods}


async def create_food(food_data: FoodCreate):
    print("API hit: add food")
    print("Food received:", food_data.model_dump())
    result = foods_collection.insert_one(food_document(**food_data.model_dump()))
    print("Inserted ID:", result.inserted_id)
    print("DB success")
    created_food = foods_collection.find_one({"_id": result.inserted_id})
    return {"message": "Food created successfully", "id": str(result.inserted_id), "food": food_response(created_food)}


async def update_food(id: str, food_data: FoodUpdate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid food id")

    update_data = food_document(**food_data.model_dump())
    update_data.pop("createdAt", None)
    result = foods_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")

    updated_food = foods_collection.find_one({"_id": ObjectId(id)})
    return {"message": "Food updated successfully", "food": food_response(updated_food)}


async def delete_food(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid food id")

    result = foods_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")

    return {"message": "Food deleted successfully"}
