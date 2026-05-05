from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from models.user import UserCreate, UserLogin
from utils.auth import get_password_hash, verify_password, create_access_token
from database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()
    user_dict["preferences"] = {}
    
    result = await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": str(result.inserted_id), "email": user.email})
    
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "message": "User created successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(result.inserted_id)
        }
    )

@router.post("/login")
async def login(user: UserLogin):
    db = get_db()
    
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(db_user["_id"]), "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(db_user["_id"]),
        "user_name": db_user["name"]
    }