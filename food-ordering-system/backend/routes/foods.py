from fastapi import APIRouter, HTTPException
from database import get_db
from bson import ObjectId

router = APIRouter(prefix="/api/foods", tags=["Foods"])

@router.get("/")
async def get_all_foods():
    db = get_db()
    foods = await db.foods.find().to_list(length=100)
    
    for food in foods:
        food["id"] = str(food["_id"])
        del food["_id"]
    
    return foods

@router.get("/{food_id}")
async def get_food(food_id: str):
    db = get_db()
    try:
        food = await db.foods.find_one({"_id": ObjectId(food_id)})
        if not food:
            raise HTTPException(status_code=404, detail="Food not found")
        
        food["id"] = str(food["_id"])
        del food["_id"]
        return food
    except:
        raise HTTPException(status_code=400, detail="Invalid food ID")