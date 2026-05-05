from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import random

# Configuration
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "food_ordering"
SECRET_KEY = "mysecretkey123456789"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ============ MODELS ============
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class Address(BaseModel):
    id: Optional[str] = None
    street: str
    city: str
    state: str
    pincode: str
    label: str = "Home"
    is_default: bool = False

class CartAddItem(BaseModel):
    food_id: str
    quantity: int = 1

class OrderItem(BaseModel):
    food_id: str
    name: str
    restaurant_id: str
    restaurant_name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_price: float
    address_id: Optional[str] = None
    delivery_address: Optional[dict] = None

class ChatRequest(BaseModel):
    mood: str
    time_of_day: str = None

class AdminCreate(BaseModel):
    email: str
    password: str
    name: str
    secret_key: str

class RestaurantCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    location: str
    cuisine: str
    description: Optional[str] = ""
    image: Optional[str] = ""
    opening_time: str = "10:00"
    closing_time: str = "22:00"
    is_active: bool = True

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    cuisine: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_active: Optional[bool] = None

class FoodCreate(BaseModel):
    name: str
    restaurant_id: str
    restaurant_name: str
    price: float
    image: str
    category: str
    rating: float
    meal_type: str
    mood_tags: List[str]
    price_range: str
    is_available: bool = True
    description: Optional[str] = ""

class FoodUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    meal_type: Optional[str] = None
    mood_tags: Optional[List[str]] = None
    price_range: Optional[str] = None
    is_available: Optional[bool] = None
    description: Optional[str] = None

class RestaurantLogin(BaseModel):
    email: str
    password: str

# ============ HELPER FUNCTIONS ============
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def get_current_restaurant(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    restaurant = await db.restaurants.find_one({"_id": ObjectId(payload.get("sub"))})
    if not restaurant:
        raise HTTPException(status_code=401, detail="Restaurant not found")
    return restaurant

def get_time_based_meal():
    hour = datetime.now().hour
    if 5 <= hour < 11:
        return "breakfast"
    elif 11 <= hour < 16:
        return "lunch"
    elif 16 <= hour < 19:
        return "snacks"
    else:
        return "dinner"

# ============ RESTAURANTS WITH PROPER LOGOS ============
SAMPLE_RESTAURANTS = [
    {"name": "Moti Mahal Deluxe", "email": "moti@mahal.com", "password": get_password_hash("rest123"), "phone": "+91 9876543210", "location": "Connaught Place, Delhi", "cuisine": "North Indian", "description": "Famous for Butter Chicken since 1920", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300", "opening_time": "11:00", "closing_time": "23:00", "is_active": True, "role": "restaurant", "created_at": datetime.utcnow()},
    {"name": "Paradise Biryani", "email": "paradise@biryani.com", "password": get_password_hash("rest123"), "phone": "+91 9876543211", "location": "Jubilee Hills, Hyderabad", "cuisine": "Hyderabadi", "description": "Best Biryani in town", "image": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300", "opening_time": "11:30", "closing_time": "22:30", "is_active": True, "role": "restaurant", "created_at": datetime.utcnow()},
    {"name": "South Indian Delight", "email": "south@delight.com", "password": get_password_hash("rest123"), "phone": "+91 9876543212", "location": "Indiranagar, Bangalore", "cuisine": "South Indian", "description": "Authentic South Indian cuisine", "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "opening_time": "07:00", "closing_time": "22:00", "is_active": True, "role": "restaurant", "created_at": datetime.utcnow()},
    {"name": "Mumbai Street Food", "email": "mumbai@street.com", "password": get_password_hash("rest123"), "phone": "+91 9876543213", "location": "Bandra, Mumbai", "cuisine": "Street Food", "description": "Famous street food of Mumbai", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "opening_time": "16:00", "closing_time": "23:00", "is_active": True, "role": "restaurant", "created_at": datetime.utcnow()},
    {"name": "Punjab Kitchen", "email": "punjab@kitchen.com", "password": get_password_hash("rest123"), "phone": "+91 9876543214", "location": "Rajouri Garden, Delhi", "cuisine": "Punjabi", "description": "Rich Punjabi flavors", "image": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300", "opening_time": "12:00", "closing_time": "23:30", "is_active": True, "role": "restaurant", "created_at": datetime.utcnow()},
]

# ============ FOOD ITEMS WITH PROPER MATCHING IMAGES ============
SAMPLE_FOODS = [
    # Moti Mahal Deluxe Items
    {"name": "Butter Chicken", "restaurant_id": "temp", "restaurant_name": "Moti Mahal Deluxe", "price": 250, "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300", "category": "Lunch", "rating": 4.9, "meal_type": "lunch", "mood_tags": ["happy", "energetic"], "price_range": "medium", "is_available": True, "description": "Famous creamy butter chicken with rich tomato gravy"},
    {"name": "Dal Makhani", "restaurant_id": "temp", "restaurant_name": "Moti Mahal Deluxe", "price": 150, "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300", "category": "Lunch", "rating": 4.7, "meal_type": "lunch", "mood_tags": ["normal", "happy"], "price_range": "cheap", "is_available": True, "description": "Creamy black lentils slow-cooked overnight"},
    {"name": "Tandoori Chicken", "restaurant_id": "temp", "restaurant_name": "Moti Mahal Deluxe", "price": 280, "image": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300", "category": "Dinner", "rating": 4.8, "meal_type": "dinner", "mood_tags": ["happy", "energetic"], "price_range": "medium", "is_available": True, "description": "Smoky tandoori chicken marinated in spices"},
    {"name": "Paneer Tikka", "restaurant_id": "temp", "restaurant_name": "Moti Mahal Deluxe", "price": 220, "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", "category": "Snacks", "rating": 4.7, "meal_type": "snacks", "mood_tags": ["happy"], "price_range": "medium", "is_available": True, "description": "Grilled cottage cheese with bell peppers"},
    {"name": "Garlic Naan", "restaurant_id": "temp", "restaurant_name": "Moti Mahal Deluxe", "price": 40, "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300", "category": "Dinner", "rating": 4.6, "meal_type": "dinner", "mood_tags": ["normal"], "price_range": "cheap", "is_available": True, "description": "Soft naan bread with garlic butter"},
    
    # Paradise Biryani Items
    {"name": "Chicken Biryani", "restaurant_id": "temp", "restaurant_name": "Paradise Biryani", "price": 220, "image": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300", "category": "Lunch", "rating": 4.8, "meal_type": "lunch", "mood_tags": ["happy", "energetic"], "price_range": "medium", "is_available": True, "description": "Famous Hyderabadi biryani with aromatic spices"},
    {"name": "Mutton Biryani", "restaurant_id": "temp", "restaurant_name": "Paradise Biryani", "price": 320, "image": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300", "category": "Lunch", "rating": 4.9, "meal_type": "lunch", "mood_tags": ["happy"], "price_range": "expensive", "is_available": True, "description": "Rich mutton biryani cooked with tender meat"},
    {"name": "Veg Biryani", "restaurant_id": "temp", "restaurant_name": "Paradise Biryani", "price": 180, "image": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300", "category": "Lunch", "rating": 4.5, "meal_type": "lunch", "mood_tags": ["normal"], "price_range": "cheap", "is_available": True, "description": "Fragrant vegetable biryani"},
    {"name": "Mirchi Ka Salan", "restaurant_id": "temp", "restaurant_name": "Paradise Biryani", "price": 120, "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300", "category": "Side Dish", "rating": 4.6, "meal_type": "lunch", "mood_tags": ["chatpata"], "price_range": "cheap", "is_available": True, "description": "Spicy chili curry - perfect with biryani"},
    
    # South Indian Delight Items
    {"name": "Masala Dosa", "restaurant_id": "temp", "restaurant_name": "South Indian Delight", "price": 60, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Breakfast", "rating": 4.8, "meal_type": "breakfast", "mood_tags": ["happy", "energetic"], "price_range": "cheap", "is_available": True, "description": "Crispy dosa filled with spiced potato masala"},
    {"name": "Idli Sambhar", "restaurant_id": "temp", "restaurant_name": "South Indian Delight", "price": 40, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Breakfast", "rating": 4.7, "meal_type": "breakfast", "mood_tags": ["happy", "normal"], "price_range": "cheap", "is_available": True, "description": "Soft idli served with hot sambhar"},
    {"name": "Medu Vada", "restaurant_id": "temp", "restaurant_name": "South Indian Delight", "price": 40, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Snacks", "rating": 4.6, "meal_type": "snacks", "mood_tags": ["happy"], "price_range": "cheap", "is_available": True, "description": "Crispy lentil doughnuts"},
    {"name": "Uttapam", "restaurant_id": "temp", "restaurant_name": "South Indian Delight", "price": 70, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Breakfast", "rating": 4.6, "meal_type": "breakfast", "mood_tags": ["happy"], "price_range": "cheap", "is_available": True, "description": "Thick pancake with onions and tomatoes"},
    {"name": "Filter Coffee", "restaurant_id": "temp", "restaurant_name": "South Indian Delight", "price": 25, "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "category": "Beverages", "rating": 4.8, "meal_type": "any", "mood_tags": ["tired", "energetic"], "price_range": "cheap", "is_available": True, "description": "Authentic South Indian filter coffee"},
    
    # Mumbai Street Food Items
    {"name": "Vada Pav", "restaurant_id": "temp", "restaurant_name": "Mumbai Street Food", "price": 30, "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "category": "Snacks", "rating": 4.6, "meal_type": "snacks", "mood_tags": ["happy", "energetic"], "price_range": "cheap", "is_available": True, "description": "Mumbai's famous burger - spicy potato fritter in bread"},
    {"name": "Pani Puri", "restaurant_id": "temp", "restaurant_name": "Mumbai Street Food", "price": 30, "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "category": "Snacks", "rating": 4.8, "meal_type": "snacks", "mood_tags": ["happy", "excited", "chatpata"], "price_range": "cheap", "is_available": True, "description": "Tangy water-filled crispy puris"},
    {"name": "Pav Bhaji", "restaurant_id": "temp", "restaurant_name": "Mumbai Street Food", "price": 60, "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "category": "Snacks", "rating": 4.7, "meal_type": "snacks", "mood_tags": ["happy", "energetic"], "price_range": "cheap", "is_available": True, "description": "Mixed vegetable curry served with buttered bread"},
    {"name": "Samosa", "restaurant_id": "temp", "restaurant_name": "Mumbai Street Food", "price": 20, "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "category": "Snacks", "rating": 4.6, "meal_type": "snacks", "mood_tags": ["happy", "sad"], "price_range": "cheap", "is_available": True, "description": "Crispy triangle pastry with spiced potato filling"},
    {"name": "Bhel Puri", "restaurant_id": "temp", "restaurant_name": "Mumbai Street Food", "price": 35, "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "category": "Snacks", "rating": 4.6, "meal_type": "snacks", "mood_tags": ["happy", "chatpata"], "price_range": "cheap", "is_available": True, "description": "Puffed rice mixed with tangy chutneys"},
    
    # Punjab Kitchen Items
    {"name": "Aloo Paratha", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 50, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Breakfast", "rating": 4.7, "meal_type": "breakfast", "mood_tags": ["happy", "energetic"], "price_range": "cheap", "is_available": True, "description": "Stuffed flatbread with spiced mashed potatoes"},
    {"name": "Chole Bhature", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 70, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Breakfast", "rating": 4.8, "meal_type": "breakfast", "mood_tags": ["happy", "energetic"], "price_range": "cheap", "is_available": True, "description": "Spicy chickpea curry with fried bread"},
    {"name": "Amritsari Kulcha", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 60, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Breakfast", "rating": 4.7, "meal_type": "breakfast", "mood_tags": ["happy"], "price_range": "cheap", "is_available": True, "description": "Stuffed flatbread from Amritsar"},
    {"name": "Lassi", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 50, "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "category": "Beverages", "rating": 4.8, "meal_type": "any", "mood_tags": ["happy"], "price_range": "cheap", "is_available": True, "description": "Traditional Punjabi yogurt drink"},
    
    # Additional Desserts & Beverages
    {"name": "Gulab Jamun", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 60, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Dessert", "rating": 4.8, "meal_type": "dinner", "mood_tags": ["happy", "sad"], "price_range": "cheap", "is_available": True, "description": "Soft milk dumplings in sugar syrup"},
    {"name": "Jalebi", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 40, "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "category": "Dessert", "rating": 4.7, "meal_type": "dinner", "mood_tags": ["happy"], "price_range": "cheap", "is_available": True, "description": "Crispy spiral-shaped sweet"},
    {"name": "Masala Chai", "restaurant_id": "temp", "restaurant_name": "Mumbai Street Food", "price": 20, "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "category": "Beverages", "rating": 4.6, "meal_type": "any", "mood_tags": ["tired", "sad"], "price_range": "cheap", "is_available": True, "description": "Indian spiced tea"},
    {"name": "Mango Lassi", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 70, "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "category": "Beverages", "rating": 4.8, "meal_type": "any", "mood_tags": ["happy"], "price_range": "cheap", "is_available": True, "description": "Sweet mango yogurt smoothie"},
    {"name": "Ice Cream", "restaurant_id": "temp", "restaurant_name": "Punjab Kitchen", "price": 80, "image": "https://images.unsplash.com/photo-1570197788417-0e82375c9373?w=300", "category": "Dessert", "rating": 4.7, "meal_type": "any", "mood_tags": ["sad", "happy"], "price_range": "cheap", "is_available": True, "description": "Creamy vanilla ice cream"},
]

# Create app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        await db.command("ping")
        print("✅ MongoDB connected!")
        
        # Create admin user if not exists
        admin_exists = await db.users.find_one({"email": "admin@foodiehub.com"})
        if not admin_exists:
            admin_user = {
                "name": "Super Admin",
                "email": "admin@foodiehub.com",
                "password": get_password_hash("admin123"),
                "role": "admin",
                "created_at": datetime.utcnow(),
                "addresses": [],
                "phone": "9999999999"
            }
            await db.users.insert_one(admin_user)
            print("✅ Admin user created! Email: admin@foodiehub.com, Password: admin123")
        
        # Create test user
        test_user_exists = await db.users.find_one({"email": "user@test.com"})
        if not test_user_exists:
            test_user = {
                "name": "Test User",
                "email": "user@test.com",
                "password": get_password_hash("user123"),
                "role": "user",
                "created_at": datetime.utcnow(),
                "addresses": [
                    {
                        "id": "addr1",
                        "street": "123 Main Street",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "pincode": "400001",
                        "label": "Home",
                        "is_default": True
                    }
                ],
                "phone": "9876543210"
            }
            await db.users.insert_one(test_user)
            print("✅ Test user created! Email: user@test.com, Password: user123")
        
        # Add restaurants
        restaurant_count = await db.restaurants.count_documents({})
        if restaurant_count == 0:
            print("🔄 Adding restaurants...")
            for restaurant in SAMPLE_RESTAURANTS:
                result = await db.restaurants.insert_one(restaurant)
                # Update food items with correct restaurant_id
                for food in SAMPLE_FOODS:
                    if food["restaurant_name"] == restaurant["name"]:
                        food["restaurant_id"] = str(result.inserted_id)
            print(f"✅ {len(SAMPLE_RESTAURANTS)} restaurants added!")
        
        # Add foods
        food_count = await db.foods.count_documents({})
        if food_count == 0:
            print("🔄 Adding food items...")
            valid_foods = [f for f in SAMPLE_FOODS if f["restaurant_id"] != "temp"]
            if valid_foods:
                await db.foods.insert_many(valid_foods)
                print(f"✅ {len(valid_foods)} food items added!")
        
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.restaurants.create_index("email", unique=True)
        
        print(f"\n📊 FINAL DATABASE STATISTICS:")
        print(f"   🏪 Restaurants: {await db.restaurants.count_documents({})}")
        print(f"   🍕 Food Items: {await db.foods.count_documents({})}")
        print(f"   👤 Users: {await db.users.count_documents({})}")
        print("\n✅ Database ready!")
        
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")

# ============ USER AUTH & PROFILE ============
@app.post("/api/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["addresses"] = []
    user_dict["role"] = "user"
    result = await db.users.insert_one(user_dict)
    token = create_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer", "user_id": str(result.inserted_id)}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token({"sub": str(db_user["_id"])})
    return {"access_token": token, "token_type": "bearer", "user_id": str(db_user["_id"]), "user_name": db_user["name"]}

@app.get("/api/user/profile")
async def get_profile(user=Depends(get_current_user)):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "addresses": user.get("addresses", [])
    }

@app.put("/api/user/profile")
async def update_profile(update: UserUpdate, user=Depends(get_current_user)):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    if update_dict:
        await db.users.update_one({"_id": user["_id"]}, {"$set": update_dict})
    return {"message": "Profile updated"}

# ============ ADDRESS ENDPOINTS ============
@app.post("/api/user/address")
async def add_address(address: Address, user=Depends(get_current_user)):
    address_dict = address.dict()
    address_dict["id"] = str(ObjectId())
    addresses = user.get("addresses", [])
    addresses.append(address_dict)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"addresses": addresses}})
    return {"message": "Address added", "address": address_dict}

@app.put("/api/user/address/{address_id}")
async def update_address(address_id: str, address: Address, user=Depends(get_current_user)):
    addresses = user.get("addresses", [])
    for i, addr in enumerate(addresses):
        if addr.get("id") == address_id:
            addresses[i] = {**address.dict(), "id": address_id}
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"addresses": addresses}})
            return {"message": "Address updated"}
    raise HTTPException(404, "Address not found")

@app.delete("/api/user/address/{address_id}")
async def delete_address(address_id: str, user=Depends(get_current_user)):
    addresses = user.get("addresses", [])
    addresses = [addr for addr in addresses if addr.get("id") != address_id]
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"addresses": addresses}})
    return {"message": "Address deleted"}

# ============ FOOD ENDPOINTS (USER) ============
@app.get("/api/foods")
async def get_foods():
    foods = await db.foods.find({"is_available": True}).to_list(length=200)
    for f in foods:
        f["id"] = str(f["_id"])
        del f["_id"]
    return foods

@app.get("/api/foods/category/{category}")
async def get_foods_by_category(category: str):
    foods = await db.foods.find({"category": category, "is_available": True}).to_list(length=200)
    for f in foods:
        f["id"] = str(f["_id"])
        del f["_id"]
    return foods

@app.get("/api/foods/restaurant/{restaurant_id}")
async def get_foods_by_restaurant(restaurant_id: str):
    foods = await db.foods.find({"restaurant_id": restaurant_id, "is_available": True}).to_list(length=200)
    for f in foods:
        f["id"] = str(f["_id"])
        del f["_id"]
    return foods

@app.get("/api/restaurants")
async def get_restaurants():
    restaurants = await db.restaurants.find({"is_active": True}).to_list(length=100)
    for r in restaurants:
        r["id"] = str(r["_id"])
        del r["_id"]
        del r["password"]
    return restaurants

# ============ CART ENDPOINTS ============
@app.post("/api/cart/add")
async def add_to_cart(item: CartAddItem, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        cart = {"user_id": user_id, "items": []}
        await db.carts.insert_one(cart)
    found = False
    for i in cart["items"]:
        if i["food_id"] == item.food_id:
            i["quantity"] += item.quantity
            found = True
            break
    if not found:
        cart["items"].append({"food_id": item.food_id, "quantity": item.quantity})
    await db.carts.update_one({"user_id": user_id}, {"$set": {"items": cart["items"]}})
    return {"message": "Added to cart"}

@app.get("/api/cart")
async def get_cart(user=Depends(get_current_user)):
    user_id = str(user["_id"])
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        return {"items": [], "total": 0}
    items = []
    total = 0
    for i in cart["items"]:
        food = await db.foods.find_one({"_id": ObjectId(i["food_id"])})
        if food:
            items.append({
                "food_id": i["food_id"],
                "name": food["name"],
                "restaurant_id": food.get("restaurant_id"),
                "restaurant_name": food.get("restaurant_name"),
                "price": food["price"],
                "quantity": i["quantity"],
                "image": food["image"]
            })
            total += food["price"] * i["quantity"]
    return {"items": items, "total": total}

@app.delete("/api/cart/remove/{food_id}")
async def remove_from_cart(food_id: str, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    cart = await db.carts.find_one({"user_id": user_id})
    if cart:
        cart["items"] = [i for i in cart["items"] if i["food_id"] != food_id]
        await db.carts.update_one({"user_id": user_id}, {"$set": {"items": cart["items"]}})
    return {"message": "Removed"}

@app.put("/api/cart/update/{food_id}")
async def update_quantity(food_id: str, quantity: int, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    cart = await db.carts.find_one({"user_id": user_id})
    if cart:
        for i in cart["items"]:
            if i["food_id"] == food_id:
                if quantity <= 0:
                    cart["items"].remove(i)
                else:
                    i["quantity"] = quantity
                break
        await db.carts.update_one({"user_id": user_id}, {"$set": {"items": cart["items"]}})
    return {"message": "Updated"}

# ============ ORDER ENDPOINTS ============
@app.post("/api/orders")
async def create_order(order: OrderCreate, user=Depends(get_current_user)):
    address = None
    if order.address_id:
        for addr in user.get("addresses", []):
            if addr.get("id") == order.address_id:
                address = addr
                break
    elif order.delivery_address:
        address = order.delivery_address
    
    new_order = {
        "user_id": str(user["_id"]),
        "items": [item.dict() for item in order.items],
        "total_price": order.total_price,
        "status": "pending",
        "address": address,
        "currency": "INR",
        "created_at": datetime.utcnow()
    }
    result = await db.orders.insert_one(new_order)
    await db.carts.update_one({"user_id": str(user["_id"])}, {"$set": {"items": []}})
    return {"message": "Order placed", "order_id": str(result.inserted_id)}

@app.get("/api/orders")
async def get_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": str(user["_id"])}).to_list(length=50)
    for o in orders:
        o["id"] = str(o["_id"])
        del o["_id"]
    return orders

# ============ ADMIN ENDPOINTS ============
@app.post("/api/admin/register")
async def register_admin(admin: AdminCreate):
    if admin.secret_key != "ADMIN_SECRET_123":
        raise HTTPException(403, "Invalid secret key")
    
    existing = await db.users.find_one({"email": admin.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    
    admin_dict = {
        "name": admin.name,
        "email": admin.email,
        "password": get_password_hash(admin.password),
        "role": "admin",
        "created_at": datetime.utcnow(),
        "addresses": [],
        "phone": ""
    }
    result = await db.users.insert_one(admin_dict)
    token = create_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer", "user_id": str(result.inserted_id)}

@app.get("/api/admin/dashboard")
async def admin_dashboard(admin=Depends(get_current_admin)):
    total_users = await db.users.count_documents({"role": {"$ne": "admin"}})
    total_foods = await db.foods.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_restaurants = await db.restaurants.count_documents({})
    total_revenue = 0
    
    orders = await db.orders.find().to_list(length=1000)
    for order in orders:
        total_revenue += order.get("total_price", 0)
    
    recent_orders = await db.orders.find().sort("created_at", -1).limit(10).to_list(length=10)
    for o in recent_orders:
        o["id"] = str(o["_id"])
        del o["_id"]
        user = await db.users.find_one({"_id": ObjectId(o["user_id"])})
        o["user_name"] = user.get("name", "Unknown") if user else "Unknown"
    
    category_sales = {}
    monthly_sales = {}
    for order in orders:
        for item in order.get("items", []):
            cat = item.get("category", "Other")
            category_sales[cat] = category_sales.get(cat, 0) + (item.get("price", 0) * item.get("quantity", 1))
        month = order.get("created_at", datetime.utcnow()).strftime("%Y-%m")
        monthly_sales[month] = monthly_sales.get(month, 0) + order.get("total_price", 0)
    
    return {
        "total_users": total_users,
        "total_foods": total_foods,
        "total_orders": total_orders,
        "total_restaurants": total_restaurants,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders,
        "category_sales": category_sales,
        "monthly_sales": monthly_sales
    }

# Admin - User Management
@app.get("/api/admin/users")
async def get_all_users(admin=Depends(get_current_admin)):
    users = await db.users.find({}).to_list(length=1000)
    for u in users:
        u["id"] = str(u["_id"])
        del u["_id"]
        del u["password"]
    return {"users": users}

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(get_current_admin)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user.get("role") == "admin":
        raise HTTPException(403, "Cannot delete admin users")
    await db.users.delete_one({"_id": ObjectId(user_id)})
    await db.carts.delete_many({"user_id": user_id})
    await db.orders.delete_many({"user_id": user_id})
    return {"message": "User deleted"}

# Admin - Restaurant Management
@app.get("/api/admin/restaurants")
async def get_all_restaurants_admin(admin=Depends(get_current_admin)):
    restaurants = await db.restaurants.find({}).to_list(length=1000)
    for r in restaurants:
        r["id"] = str(r["_id"])
        del r["_id"]
        del r["password"]
    return {"restaurants": restaurants}

@app.post("/api/admin/restaurants")
async def create_restaurant_admin(restaurant: RestaurantCreate, admin=Depends(get_current_admin)):
    existing = await db.restaurants.find_one({"email": restaurant.email})
    if existing:
        raise HTTPException(400, "Restaurant already exists")
    
    restaurant_dict = restaurant.dict()
    restaurant_dict["password"] = get_password_hash(restaurant.password)
    restaurant_dict["role"] = "restaurant"
    restaurant_dict["created_at"] = datetime.utcnow()
    restaurant_dict["orders_completed"] = 0
    restaurant_dict["total_revenue"] = 0
    
    result = await db.restaurants.insert_one(restaurant_dict)
    return {"message": "Restaurant created", "id": str(result.inserted_id)}

@app.put("/api/admin/restaurants/{restaurant_id}")
async def update_restaurant_admin(restaurant_id: str, update: RestaurantUpdate, admin=Depends(get_current_admin)):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    if update_dict:
        await db.restaurants.update_one({"_id": ObjectId(restaurant_id)}, {"$set": update_dict})
    return {"message": "Restaurant updated"}

@app.delete("/api/admin/restaurants/{restaurant_id}")
async def delete_restaurant_admin(restaurant_id: str, admin=Depends(get_current_admin)):
    await db.foods.delete_many({"restaurant_id": restaurant_id})
    await db.restaurants.delete_one({"_id": ObjectId(restaurant_id)})
    return {"message": "Restaurant deleted"}

# Admin - Food Management
@app.get("/api/admin/foods")
async def get_all_foods_admin(admin=Depends(get_current_admin)):
    foods = await db.foods.find().to_list(length=1000)
    for f in foods:
        f["id"] = str(f["_id"])
        del f["_id"]
    return {"foods": foods}

@app.post("/api/admin/foods")
async def create_food_admin(food: FoodCreate, admin=Depends(get_current_admin)):
    food_dict = food.dict()
    food_dict["created_at"] = datetime.utcnow()
    result = await db.foods.insert_one(food_dict)
    return {"message": "Food created", "id": str(result.inserted_id)}

@app.put("/api/admin/foods/{food_id}")
async def update_food_admin(food_id: str, update: FoodUpdate, admin=Depends(get_current_admin)):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    if update_dict:
        await db.foods.update_one({"_id": ObjectId(food_id)}, {"$set": update_dict})
    return {"message": "Food updated"}

@app.delete("/api/admin/foods/{food_id}")
async def delete_food_admin(food_id: str, admin=Depends(get_current_admin)):
    await db.foods.delete_one({"_id": ObjectId(food_id)})
    return {"message": "Food deleted"}

# Admin - Order Management
@app.get("/api/admin/orders")
async def get_all_orders_admin(admin=Depends(get_current_admin)):
    orders = await db.orders.find().sort("created_at", -1).to_list(length=1000)
    for o in orders:
        o["id"] = str(o["_id"])
        del o["_id"]
        user = await db.users.find_one({"_id": ObjectId(o["user_id"])})
        o["user_name"] = user.get("name", "Unknown") if user else "Unknown"
    return {"orders": orders}

@app.put("/api/admin/orders/{order_id}/status")
async def update_order_status_admin(order_id: str, status: str, admin=Depends(get_current_admin)):
    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": status}})
    return {"message": f"Order status updated to {status}"}

# ============ RESTAURANT ENDPOINTS ============
@app.post("/api/restaurant/register")
async def register_restaurant(restaurant: RestaurantCreate):
    existing = await db.restaurants.find_one({"email": restaurant.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    
    restaurant_dict = restaurant.dict()
    restaurant_dict["password"] = get_password_hash(restaurant.password)
    restaurant_dict["role"] = "restaurant"
    restaurant_dict["created_at"] = datetime.utcnow()
    restaurant_dict["orders_completed"] = 0
    restaurant_dict["total_revenue"] = 0
    
    result = await db.restaurants.insert_one(restaurant_dict)
    token = create_token({"sub": str(result.inserted_id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "restaurant_id": str(result.inserted_id),
        "restaurant_name": restaurant.name
    }

@app.post("/api/restaurant/login")
async def login_restaurant(login: RestaurantLogin):
    restaurant = await db.restaurants.find_one({"email": login.email})
    if not restaurant or not verify_password(login.password, restaurant["password"]):
        raise HTTPException(401, "Invalid credentials")
    
    token = create_token({"sub": str(restaurant["_id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "restaurant_id": str(restaurant["_id"]),
        "restaurant_name": restaurant["name"]
    }

@app.get("/api/restaurant/profile")
async def get_restaurant_profile(restaurant=Depends(get_current_restaurant)):
    return {
        "id": str(restaurant["_id"]),
        "name": restaurant["name"],
        "email": restaurant["email"],
        "phone": restaurant.get("phone", ""),
        "location": restaurant.get("location", ""),
        "cuisine": restaurant.get("cuisine", ""),
        "description": restaurant.get("description", ""),
        "image": restaurant.get("image", ""),
        "opening_time": restaurant.get("opening_time", ""),
        "closing_time": restaurant.get("closing_time", ""),
        "orders_completed": restaurant.get("orders_completed", 0),
        "total_revenue": restaurant.get("total_revenue", 0)
    }

# Restaurant - Food Management
@app.get("/api/restaurant/foods")
async def get_restaurant_foods(restaurant=Depends(get_current_restaurant)):
    foods = await db.foods.find({"restaurant_id": str(restaurant["_id"])}).to_list(length=200)
    for f in foods:
        f["id"] = str(f["_id"])
        del f["_id"]
    return {"foods": foods}

@app.post("/api/restaurant/foods")
async def create_restaurant_food(food: FoodCreate, restaurant=Depends(get_current_restaurant)):
    food_dict = food.dict()
    food_dict["restaurant_id"] = str(restaurant["_id"])
    food_dict["restaurant_name"] = restaurant["name"]
    food_dict["created_at"] = datetime.utcnow()
    result = await db.foods.insert_one(food_dict)
    return {"message": "Food created", "id": str(result.inserted_id)}

@app.put("/api/restaurant/foods/{food_id}")
async def update_restaurant_food(food_id: str, update: FoodUpdate, restaurant=Depends(get_current_restaurant)):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    if update_dict:
        await db.foods.update_one(
            {"_id": ObjectId(food_id), "restaurant_id": str(restaurant["_id"])},
            {"$set": update_dict}
        )
    return {"message": "Food updated"}

@app.delete("/api/restaurant/foods/{food_id}")
async def delete_restaurant_food(food_id: str, restaurant=Depends(get_current_restaurant)):
    await db.foods.delete_one({"_id": ObjectId(food_id), "restaurant_id": str(restaurant["_id"])})
    return {"message": "Food deleted"}

@app.patch("/api/restaurant/foods/{food_id}/availability")
async def toggle_food_availability(food_id: str, is_available: bool, restaurant=Depends(get_current_restaurant)):
    await db.foods.update_one(
        {"_id": ObjectId(food_id), "restaurant_id": str(restaurant["_id"])},
        {"$set": {"is_available": is_available}}
    )
    status = "available" if is_available else "sold out"
    return {"message": f"Food marked as {status}"}

# Restaurant - Order Management
@app.get("/api/restaurant/orders")
async def get_restaurant_orders(restaurant=Depends(get_current_restaurant)):
    restaurant_id = str(restaurant["_id"])
    restaurant_name = restaurant["name"]
    
    all_orders = await db.orders.find().sort("created_at", -1).to_list(length=500)
    
    restaurant_orders = []
    for order in all_orders:
        restaurant_items = []
        for item in order.get("items", []):
            if item.get("restaurant_id") == restaurant_id or item.get("restaurant_name") == restaurant_name:
                restaurant_items.append(item)
        
        if restaurant_items:
            user = await db.users.find_one({"_id": ObjectId(order["user_id"])})
            
            restaurant_orders.append({
                "id": str(order["_id"]),
                "user_name": user.get("name", "Unknown") if user else "Unknown",
                "user_email": user.get("email", "Unknown") if user else "Unknown",
                "user_phone": user.get("phone", "Not provided") if user else "Not provided",
                "delivery_address": order.get("address", {}),
                "items": restaurant_items,
                "total_amount": sum(item.get("price", 0) * item.get("quantity", 1) for item in restaurant_items),
                "total_order_amount": order.get("total_price", 0),
                "status": order.get("status", "pending"),
                "created_at": order.get("created_at"),
                "order_date": order.get("created_at").strftime("%d/%m/%Y %H:%M") if order.get("created_at") else "Unknown"
            })
    
    return {"orders": restaurant_orders}

@app.put("/api/restaurant/orders/{order_id}/status")
async def update_restaurant_order_status(order_id: str, status: str, restaurant=Depends(get_current_restaurant)):
    valid_statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(400, f"Invalid status")
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(404, "Order not found")
    
    if status == "delivered":
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        restaurant_name = restaurant["name"]
        restaurant_revenue = 0
        for item in order.get("items", []):
            if item.get("restaurant_name") == restaurant_name:
                restaurant_revenue += item.get("price", 0) * item.get("quantity", 1)
        
        await db.restaurants.update_one(
            {"_id": restaurant["_id"]},
            {"$inc": {"orders_completed": 1, "total_revenue": restaurant_revenue}}
        )
    
    return {"message": f"Order status updated to {status}"}

@app.get("/api/restaurant/stats")
async def get_restaurant_stats(restaurant=Depends(get_current_restaurant)):
    orders_data = await get_restaurant_orders(restaurant)
    orders = orders_data["orders"]
    
    return {
        "restaurant_name": restaurant["name"],
        "total_orders": len(orders),
        "pending_orders": len([o for o in orders if o["status"] == "pending"]),
        "confirmed_orders": len([o for o in orders if o["status"] == "confirmed"]),
        "preparing_orders": len([o for o in orders if o["status"] == "preparing"]),
        "out_for_delivery": len([o for o in orders if o["status"] == "out_for_delivery"]),
        "delivered_orders": len([o for o in orders if o["status"] == "delivered"]),
        "cancelled_orders": len([o for o in orders if o["status"] == "cancelled"]),
        "orders_completed": restaurant.get("orders_completed", 0),
        "total_revenue": restaurant.get("total_revenue", 0)
    }

# ============ AI RECOMMENDATION ============
@app.get("/api/recommend")
async def recommend(budget: str = "medium", user=Depends(get_current_user)):
    meal_type = get_time_based_meal()
    foods = await db.foods.find({"meal_type": meal_type, "is_available": True}).to_list(length=100)
    scored = []
    for food in foods:
        score = food.get("rating", 0)
        if budget == food.get("price_range", "medium"):
            score += 2
        scored.append((score, food))
    scored.sort(reverse=True, key=lambda x: x[0])
    recs = []
    for score, food in scored[:8]:
        recs.append({
            "id": str(food["_id"]),
            "name": food["name"],
            "restaurant_id": food.get("restaurant_id"),
            "restaurant_name": food.get("restaurant_name"),
            "price": food["price"],
            "image": food["image"],
            "category": food["category"],
            "rating": food["rating"]
        })
    return {"recommendations": recs, "meal_time": meal_type}

@app.post("/api/chat/mood-recommend")
async def mood_recommend(request: ChatRequest, user=Depends(get_current_user)):
    try:
        mood = request.mood.lower()
        meal_time = request.time_of_day or get_time_based_meal()
        
        mood_messages = {
            "sad": {"msg": "🌸 Cheer up! Here are some sweet desserts:", "category": "Dessert", "emoji": "🍰"},
            "chatpata": {"msg": "🌶️ Spicy snacks for you:", "category": "Snacks", "emoji": "🌶️"},
            "tired": {"msg": "🥤 Refreshing drinks to boost energy:", "category": "Beverages", "emoji": "🥤"},
            "happy": {"msg": "🎉 Celebration specials:", "category": "Fast Food", "emoji": "🎉"},
            "energetic": {"msg": "⚡ Power-packed meals:", "category": "Lunch", "emoji": "⚡"},
            "normal": {"msg": "🍽️ Popular recommendations:", "category": "All", "emoji": "🍽️"}
        }
        
        mood_info = mood_messages.get(mood, mood_messages["normal"])
        category_filter = mood_info["category"]
        
        if category_filter != "All":
            foods = await db.foods.find({"category": category_filter, "is_available": True}).to_list(length=50)
        else:
            foods = await db.foods.find({"is_available": True}).to_list(length=50)
        
        foods.sort(key=lambda x: x.get("rating", 0), reverse=True)
        
        recommendations = []
        for food in foods[:8]:
            recommendations.append({
                "id": str(food["_id"]),
                "name": food["name"],
                "restaurant_id": food.get("restaurant_id"),
                "restaurant_name": food.get("restaurant_name"),
                "price": food["price"],
                "image": food["image"],
                "category": food["category"],
                "rating": food["rating"],
                "why_recommended": f"Perfect for your {mood} mood! {mood_info['emoji']}"
            })
        
        return {
            "message": mood_info["msg"],
            "recommendations": recommendations,
            "mood": mood,
            "time_of_day": meal_time
        }
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(500, f"Error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Food Ordering API", "status": "running", "currency": "INR"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)