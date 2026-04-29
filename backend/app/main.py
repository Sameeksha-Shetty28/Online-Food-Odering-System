from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.db import db
from app.config.db import create_indexes
from app.routes import admin_routes, auth_routes, cart_routes, food_routes, order_routes, user_routes


app = FastAPI(
    title="Food Ordering System API",
    description="FastAPI + MongoDB backend for a React food ordering app.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    create_indexes()


@app.get("/")
async def root():
    return {
        "message": "Food Ordering System API is running",
        "docs": "http://127.0.0.1:8000/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(food_routes.router)
app.include_router(cart_routes.router)
app.include_router(order_routes.router)
app.include_router(admin_routes.router)
