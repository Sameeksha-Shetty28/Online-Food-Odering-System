from datetime import datetime, timezone
from typing import Dict


def food_document(name: str, description: str, price: float, image: str, category: str) -> Dict:
    return {
        "name": name,
        "description": description,
        "price": float(price),
        "image": image,
        "category": category,
        "createdAt": datetime.now(timezone.utc),
    }


def food_response(food: Dict) -> Dict:
    return {
        "_id": str(food["_id"]),
        "id": str(food["_id"]),
        "name": food["name"],
        "description": food.get("description", ""),
        "price": food["price"],
        "image": food.get("image", ""),
        "category": food.get("category", ""),
        "createdAt": food.get("createdAt"),
    }
