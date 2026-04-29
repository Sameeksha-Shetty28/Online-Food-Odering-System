from typing import Dict, List


def cart_document(user_id: str, items: List[Dict] | None = None) -> Dict:
    return {
        "userId": user_id,
        "items": items or [],
    }


def cart_response(cart: Dict) -> Dict:
    return {
        "id": str(cart["_id"]),
        "userId": cart["userId"],
        "items": cart.get("items", []),
    }

