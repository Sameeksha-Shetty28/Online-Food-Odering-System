from bson import ObjectId
from fastapi import HTTPException, status

from app.config.db import carts_collection, orders_collection, users_collection
from app.models.user_model import user_response


async def get_all_users():
    users = [user_response(user) for user in users_collection.find().sort("createdAt", -1)]
    return {"count": len(users), "users": users}


async def delete_user(id: str, current_admin):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    if str(current_admin["_id"]) == id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins cannot delete their own account")

    result = users_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    carts_collection.delete_many({"userId": id})
    orders_collection.delete_many({"userId": id})
    return {"message": "User and related data deleted successfully"}

