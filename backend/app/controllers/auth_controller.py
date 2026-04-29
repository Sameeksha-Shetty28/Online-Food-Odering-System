from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.config.db import users_collection
from app.models.user_model import user_document, user_response
from app.schemas.user_schema import UserLogin, UserRegister
from app.utils.jwt_handler import create_access_token
from app.utils.password_hash import hash_password, verify_password


async def register_user(user_data: UserRegister):
    existing_user = users_collection.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    hashed_password = hash_password(user_data.password)
    new_user = user_document(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
    )
    result = users_collection.insert_one(new_user)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    token = create_access_token({"sub": str(result.inserted_id), "role": created_user["role"]})

    return {
        "message": "User registered successfully",
        "token": token,
        "user": user_response(created_user),
    }


async def login_user(login_data: UserLogin):
    user = users_collection.find_one({"email": login_data.email.lower()})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user.get("role", "user")})
    return {
        "message": "Login successful",
        "token": token,
        "user": user_response(user),
    }


async def get_profile(current_user):
    return {"user": user_response(current_user)}


async def register_frontend_user(user_data: dict):
    print("Incoming data:", user_data)

    email = user_data.get("email", "").strip().lower()
    password = user_data.get("password", "").strip()
    name = user_data.get("name", "").strip()

    if not name or not email or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name, email, and password are required")

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        token = create_access_token({"sub": str(existing_user["_id"]), "role": existing_user.get("role", "user")})
        return {"message": "User already exists", "token": token, "user": user_response(existing_user)}

    new_user = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "phone": user_data.get("phone", ""),
        "role": user_data.get("role", "user"),
        "createdAt": datetime.now(timezone.utc),
    }
    result = users_collection.insert_one(new_user)
    print("Inserted ID:", result.inserted_id)

    created_user = users_collection.find_one({"_id": result.inserted_id})
    token = create_access_token({"sub": str(result.inserted_id), "role": created_user.get("role", "user")})
    return {"message": "User registered successfully", "token": token, "user": user_response(created_user)}


async def login_frontend_user(login_data: dict):
    print("Incoming data:", login_data)

    email = login_data.get("email", "").strip().lower()
    password = login_data.get("password", "").strip()
    user = users_collection.find_one({"email": email})

    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user.get("role", "user")})
    return {"message": "Login successful", "token": token, "user": user_response(user)}


async def get_user_by_id(id: str):
    print("Incoming data:", {"id": id})

    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    user = users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"user": user_response(user)}
