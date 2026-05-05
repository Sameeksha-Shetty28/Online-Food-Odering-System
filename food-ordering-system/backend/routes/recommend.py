from fastapi import APIRouter, Depends, HTTPException
from utils.ai_recommend import recommend_food
from routes.auth_utils import get_current_user

router = APIRouter(prefix="/api/recommend", tags=["Recommendations"])

@router.get("/")
async def get_recommendations(
    budget: str = "medium",
    current_user = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    recommendations = await recommend_food(user_id, budget)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail="No recommendations available")
    
    return {
        "recommendations": recommendations,
        "message": "AI-powered recommendations based on weather, mood, and your preferences"
    }