from fastapi import APIRouter, HTTPException, Depends
from models.cart import CartAddItem
from database import get_db
from bson import ObjectId
from routes.auth_utils import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])

async def get_user_cart(user_id: str):
    db = get_db()
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        cart = {"user_id": user_id, "items": []}
        result = await db.carts.insert_one(cart)
        cart["_id"] = result.inserted_id
    return cart

@router.post("/add")
async def add_to_cart(item: CartAddItem, current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    food = await db.foods.find_one({"_id": ObjectId(item.food_id)})
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    
    cart = await get_user_cart(user_id)
    
    item_exists = False
    for cart_item in cart["items"]:
        if cart_item["food_id"] == item.food_id:
            cart_item["quantity"] += item.quantity
            item_exists = True
            break
    
    if not item_exists:
        cart["items"].append({"food_id": item.food_id, "quantity": item.quantity})
    
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": cart["items"]}}
    )
    
    return {"message": "Item added to cart", "cart": cart["items"]}

@router.get("/")
async def get_cart(current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    cart = await get_user_cart(user_id)
    
    cart_items = []
    for item in cart["items"]:
        food = await db.foods.find_one({"_id": ObjectId(item["food_id"])})
        if food:
            cart_items.append({
                "food_id": item["food_id"],
                "name": food["name"],
                "price": food["price"],
                "quantity": item["quantity"],
                "image": food["image"]
            })
    
    total = sum(item["price"] * item["quantity"] for item in cart_items)
    
    return {"items": cart_items, "total": total}

@router.delete("/remove/{food_id}")
async def remove_from_cart(food_id: str, current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    cart = await get_user_cart(user_id)
    cart["items"] = [item for item in cart["items"] if item["food_id"] != food_id]
    
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": cart["items"]}}
    )
    
    return {"message": "Item removed from cart"}

@router.put("/update/{food_id}")
async def update_quantity(food_id: str, quantity: int, current_user = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    
    cart = await get_user_cart(user_id)
    
    for item in cart["items"]:
        if item["food_id"] == food_id:
            if quantity <= 0:
                cart["items"].remove(item)
            else:
                item["quantity"] = quantity
            break
    
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": cart["items"]}}
    )
    
    return {"message": "Cart updated"}