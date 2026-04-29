from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import ReturnDocument

from app.config.db import carts_collection, foods_collection
from app.models.cart_model import cart_document, cart_response
from app.schemas.cart_schema import CartItemIn, CartRemoveIn


def _require_valid_food(food_id: str):
    if not ObjectId.is_valid(food_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid food id")

    food = foods_collection.find_one({"_id": ObjectId(food_id)})
    if not food:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")
    return food


async def get_user_cart(current_user):
    user_id = str(current_user["_id"])
    cart = carts_collection.find_one({"userId": user_id})
    if not cart:
        result = carts_collection.insert_one(cart_document(user_id))
        cart = carts_collection.find_one({"_id": result.inserted_id})

    return {"cart": cart_response(cart)}


async def add_to_cart(item: CartItemIn, current_user):
    _require_valid_food(item.foodId)
    user_id = str(current_user["_id"])
    cart = carts_collection.find_one({"userId": user_id})

    if not cart:
        result = carts_collection.insert_one(cart_document(user_id, [item.model_dump()]))
        cart = carts_collection.find_one({"_id": result.inserted_id})
        return {"message": "Item added to cart", "cart": cart_response(cart)}

    existing_item = next((cart_item for cart_item in cart.get("items", []) if cart_item["foodId"] == item.foodId), None)
    if existing_item:
        carts_collection.update_one(
            {"userId": user_id, "items.foodId": item.foodId},
            {"$inc": {"items.$.quantity": item.quantity}},
        )
    else:
        carts_collection.update_one(
            {"userId": user_id},
            {"$push": {"items": item.model_dump()}},
        )

    updated_cart = carts_collection.find_one({"userId": user_id})
    return {"message": "Item added to cart", "cart": cart_response(updated_cart)}


async def remove_from_cart(item: CartRemoveIn, current_user):
    user_id = str(current_user["_id"])
    updated_cart = carts_collection.find_one_and_update(
        {"userId": user_id},
        {"$pull": {"items": {"foodId": item.foodId}}},
        return_document=ReturnDocument.AFTER,
    )

    if not updated_cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    return {"message": "Item removed from cart", "cart": cart_response(updated_cart)}


async def get_cart_by_user_id(user_id: str):
    print("Incoming data:", {"userId": user_id})

    cart = carts_collection.find_one({"userId": str(user_id)})
    if not cart:
        result = carts_collection.insert_one(cart_document(str(user_id)))
        print("Inserted ID:", result.inserted_id)
        cart = carts_collection.find_one({"_id": result.inserted_id})

    return {"cart": cart_response(cart)}


async def add_cart_item_for_user(cart_data: dict):
    print("Incoming data:", cart_data)

    user_id = str(cart_data.get("userId", ""))
    item = cart_data.get("item")

    if not user_id or not item:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="userId and item are required")

    cart = carts_collection.find_one({"userId": user_id})
    item_id = item.get("id", item.get("foodId"))

    if not cart:
        result = carts_collection.insert_one(cart_document(user_id, [item]))
        print("Inserted ID:", result.inserted_id)
        cart = carts_collection.find_one({"_id": result.inserted_id})
        return {"message": "Item added to cart", "cart": cart_response(cart)}

    existing_item = next((cart_item for cart_item in cart.get("items", []) if cart_item.get("id", cart_item.get("foodId")) == item_id), None)
    if existing_item:
        carts_collection.update_one(
            {"userId": user_id, "items.id": item_id},
            {"$set": {"items.$": item}},
        )
    else:
        carts_collection.update_one({"userId": user_id}, {"$push": {"items": item}})

    updated_cart = carts_collection.find_one({"userId": user_id})
    return {"message": "Item added to cart", "cart": cart_response(updated_cart)}


async def update_cart_by_user_id(user_id: str, cart_data: dict):
    print("Incoming data:", {"userId": user_id, **cart_data})

    result = carts_collection.update_one(
        {"userId": str(user_id)},
        {"$set": {"items": cart_data.get("items", [])}},
        upsert=True,
    )
    print("Inserted ID:", result.upserted_id)

    cart = carts_collection.find_one({"userId": str(user_id)})
    return {"message": "Cart updated successfully", "cart": cart_response(cart)}


async def clear_cart_by_user_id(user_id: str):
    print("Incoming data:", {"userId": user_id})

    result = carts_collection.delete_one({"userId": str(user_id)})
    return {"message": "Cart cleared successfully", "deletedCount": result.deleted_count}
