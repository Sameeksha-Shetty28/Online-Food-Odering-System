from datetime import datetime
from bson import ObjectId
import random
from database import get_db

async def get_weather():
    weathers = ["hot", "cold", "rainy"]
    return random.choice(weathers)

async def get_user_mood(user_id):
    hour = datetime.now().hour
    if hour < 12:
        return "energetic"
    elif hour < 18:
        return "happy"
    else:
        return "tired"

async def recommend_food(user_id: str, budget: str = "medium"):
    db = get_db()
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return []
    
    current_hour = datetime.now().hour
    weather = await get_weather()
    mood = await get_user_mood(user_id)
    
    previous_orders = await db.orders.find({"user_id": user_id}).to_list(length=10)
    previous_food_ids = []
    for order in previous_orders:
        for item in order.get("items", []):
            previous_food_ids.append(item.get("food_id"))
    
    all_foods = await db.foods.find().to_list(length=100)
    
    scored_foods = []
    for food in all_foods:
        score = 0
        
        if weather in food.get("weather_tags", []):
            score += 3
        
        if mood in food.get("mood_tags", []):
            score += 3
        
        if budget == "cheap" and food["price_range"] == "cheap":
            score += 2
        elif budget == "medium" and food["price_range"] == "medium":
            score += 2
        elif budget == "expensive" and food["price_range"] == "expensive":
            score += 2
        
        if str(food["_id"]) in previous_food_ids:
            score += 1
        
        score += food.get("rating", 0) / 2
        
        scored_foods.append((score, food))
    
    scored_foods.sort(reverse=True, key=lambda x: x[0])
    
    recommendations = []
    for score, food in scored_foods[:6]:
        food["id"] = str(food["_id"])
        del food["_id"]
        recommendations.append(food)
    
    await db.recommendations.insert_one({
        "user_id": user_id,
        "recommendations": [str(f["id"]) for f in recommendations],
        "context": {"weather": weather, "mood": mood, "budget": budget},
        "created_at": datetime.utcnow()
    })
    
    return recommendations