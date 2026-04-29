from datetime import datetime, timezone
from typing import Dict, List


def order_document(user_id: str, items: List[Dict], total_amount: float) -> Dict:
    return {
        "userId": user_id,
        "items": items,
        "totalAmount": float(total_amount),
        "status": "pending",
        "createdAt": datetime.now(timezone.utc),
    }


def order_response(order: Dict) -> Dict:
    items = order.get("items", [])
    item_text = order.get("item")
    if not item_text and items:
        item_text = ", ".join(
            f"{item.get('name', item.get('foodId', 'Item'))} x{item.get('quantity', 1)}"
            for item in items
        )

    return {
        "_id": str(order["_id"]),
        "id": str(order["_id"]),
        "userId": order["userId"],
        "items": items,
        "item": item_text or "Order items",
        "customer": order.get("customer", order.get("userId", "Customer")),
        "total": order.get("total", order.get("totalAmount", 0)),
        "totalAmount": order.get("totalAmount", order.get("total", 0)),
        "status": order.get("status", "pending"),
        "createdAt": order.get("createdAt"),
    }
