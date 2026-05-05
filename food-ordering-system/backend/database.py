from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "food_ordering")

class Database:
    client: AsyncIOMotorClient = None
    db = None

database = Database()

async def connect_to_mongo():
    database.client = AsyncIOMotorClient(MONGODB_URL)
    database.db = database.client[DATABASE_NAME]
    print("Connected to MongoDB!")

async def close_mongo_connection():
    if database.client:
        database.client.close()
        print("Closed MongoDB connection!")

def get_db():
    return database.db