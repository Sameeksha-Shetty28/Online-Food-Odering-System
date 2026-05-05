import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_to_mongo, close_mongo_connection
from models.food import SAMPLE_FOODS
from database import get_db

# Import routers directly from their files
from routes.auth import router as auth_router
from routes.foods import router as foods_router
from routes.cart import router as cart_router
from routes.orders import router as orders_router
from routes.recommend import router as recommend_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    # Initialize sample foods if database is empty
    db = get_db()
    food_count = await db.foods.count_documents({})
    if food_count == 0:
        await db.foods.insert_many(SAMPLE_FOODS)
        print("✅ Sample foods inserted!")
    
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="Food Ordering API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(foods_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(recommend_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Food Ordering System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}