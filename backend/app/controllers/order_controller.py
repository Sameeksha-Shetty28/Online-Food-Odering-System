from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.config.db import orders_collection
from app.models.order_model import order_response
from app.schemas.order_schema import OrderStatusUpdate


def _object_id_or_404(id: str) -> ObjectId:
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order id")
    return ObjectId(id)


async def create_order(order: dict):
    print("Incoming order:", order)

    if not order or not order.get("items"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order items are required")

    order["totalAmount"] = order.get("totalAmount", order.get("total", 0))
    order["createdAt"] = datetime.now(timezone.utc)

    result = orders_collection.insert_one(order)
    print("Inserted ID:", result.inserted_id)

    return {"id": str(result.inserted_id), "message": "Order placed successfully"}


async def get_user_orders(current_user):
    user_id = str(current_user["_id"])
    orders = [order_response(order) for order in orders_collection.find({"userId": user_id}).sort("createdAt", -1)]
    return {"count": len(orders), "orders": orders}


async def get_all_orders():
    orders = [order_response(order) for order in orders_collection.find().sort("createdAt", -1)]
    return {"count": len(orders), "orders": orders}


async def get_orders_by_user_id(user_id: str):
    print("Incoming data:", {"userId": user_id})

    user_ids = [user_id]
    if user_id.isdigit():
        user_ids.append(int(user_id))

    orders = [
        order_response(order)
        for order in orders_collection.find({"userId": {"$in": user_ids}}).sort("createdAt", -1)
    ]
    return {"count": len(orders), "orders": orders}


async def update_order_status(id: str, status_data: OrderStatusUpdate):
    order_id = _object_id_or_404(id)
    result = orders_collection.update_one({"_id": order_id}, {"$set": {"status": status_data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    updated_order = orders_collection.find_one({"_id": order_id})
    return {"message": "Order status updated successfully", "order": order_response(updated_order)}
