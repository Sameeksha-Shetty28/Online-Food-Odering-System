from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def clear_database():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["food_ordering"]
    
    print("🗑️ Clearing database...")
    
    # Drop all collections
    await db.foods.drop()
    await db.restaurants.drop()
    await db.users.drop()
    await db.orders.drop()
    await db.carts.drop()
    await db.recommendations.drop()
    
    print("✅ All collections cleared!")
    
    # Verify
    collections = await db.list_collection_names()
    print(f"📊 Remaining collections: {collections}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_database())