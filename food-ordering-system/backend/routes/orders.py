from fastapi import APIRouter, HTTPException, Depends
from models.order import OrderCreate
from database import get_db
from bson import ObjectId
from datetime import datetime
from routes.auth_utils import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("/")
async def create_order(order: OrderCreate, current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    new_order = {
        "user_id": user_id,
        "items": [item.dict() for item in order.items],
        "total_price": order.total_price,
        "status": "confirmed",
        "created_at": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(new_order)
    
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": []}}
    )
    
    return {
        "message": "Order placed successfully",
        "order_id": str(result.inserted_id)
    }

@router.get("/")
async def get_orders(current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    orders = await db.orders.find({"user_id": user_id}).to_list(length=50)
    
    for order in orders:
        order["id"] = str(order["_id"])
        del order["_id"]
    
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": user_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order["id"] = str(order["_id"])
        del order["_id"]
        return order
    except:
        raise HTTPException(status_code=400, detail="Invalid order ID")