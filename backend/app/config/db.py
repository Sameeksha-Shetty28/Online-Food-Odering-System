import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "food_order_db"

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DATABASE_NAME]

users_collection = db["users"]
foods_collection = db["foods"]
carts_collection = db["carts"]
orders_collection = db["orders"]


def create_indexes() -> None:
    """Create useful indexes once when the app starts."""
    users_collection.create_index("email", unique=True)
    carts_collection.create_index("userId", unique=True)
    foods_collection.create_index("category")
    orders_collection.create_index("userId")


try:
    client.admin.command("ping")
    print("MongoDB Connected Successfully!")
    print("Collections:", db.list_collection_names())
except Exception as e:
    print("MongoDB Connection Failed:", e)
