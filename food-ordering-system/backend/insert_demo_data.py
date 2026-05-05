import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import random

# Configuration
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "food_ordering"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# 25+ Restaurants Data with working images
RESTAURANTS = [
    {"name": "Moti Mahal Deluxe", "cuisine": "North Indian", "location": "Connaught Place, Delhi", "phone": "+91 9876543210", "email": "moti@mahal.com", "opening_time": "11:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300", "description": "Famous for Butter Chicken since 1920", "rating": 4.8},
    {"name": "Paradise Biryani", "cuisine": "Hyderabadi", "location": "Jubilee Hills, Hyderabad", "phone": "+91 9876543211", "email": "paradise@biryani.com", "opening_time": "11:30", "closing_time": "22:30", "image": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300", "description": "Best Biryani in town", "rating": 4.9},
    {"name": "South Indian Delight", "cuisine": "South Indian", "location": "Indiranagar, Bangalore", "phone": "+91 9876543212", "email": "south@delight.com", "opening_time": "07:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "description": "Authentic South Indian cuisine", "rating": 4.7},
    {"name": "Mumbai Street Food", "cuisine": "Street Food", "location": "Bandra, Mumbai", "phone": "+91 9876543213", "email": "mumbai@street.com", "opening_time": "16:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "description": "Famous street food of Mumbai", "rating": 4.6},
    {"name": "Punjab Kitchen", "cuisine": "Punjabi", "location": "Rajouri Garden, Delhi", "phone": "+91 9876543214", "email": "punjab@kitchen.com", "opening_time": "12:00", "closing_time": "23:30", "image": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300", "description": "Rich Punjabi flavors", "rating": 4.7},
    {"name": "K C Das", "cuisine": "Bengali Sweets", "location": "Esplanade, Kolkata", "phone": "+91 9876543215", "email": "kc@das.com", "opening_time": "09:00", "closing_time": "21:00", "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "description": "Famous for Rasgulla", "rating": 4.6},
    {"name": "Domino's Pizza", "cuisine": "Fast Food", "location": "Multiple Locations", "phone": "+91 9876543216", "email": "dominos@pizza.com", "opening_time": "11:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300", "description": "Pizza Delivery Experts", "rating": 4.5},
    {"name": "Haldiram's", "cuisine": "Indian Sweets & Snacks", "location": "Multiple Locations", "phone": "+91 9876543217", "email": "haldirams@sweets.com", "opening_time": "08:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "description": "Traditional Indian snacks", "rating": 4.6},
    {"name": "Bikanervala", "cuisine": "Indian Sweets", "location": "Karol Bagh, Delhi", "phone": "+91 9876543218", "email": "bikaner@wala.com", "opening_time": "08:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "description": "Pure vegetarian sweets", "rating": 4.5},
    {"name": "Sagar Ratna", "cuisine": "South Indian", "location": "Koramangala, Bangalore", "phone": "+91 9876543219", "email": "sagar@ratna.com", "opening_time": "07:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "description": "Authentic South Indian", "rating": 4.6},
    {"name": "Mainland China", "cuisine": "Chinese", "location": "Bandra, Mumbai", "phone": "+91 9876543220", "email": "mainland@china.com", "opening_time": "12:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300", "description": "Best Chinese cuisine", "rating": 4.7},
    {"name": "Barbeque Nation", "cuisine": "Barbecue", "location": "Multiple Locations", "phone": "+91 9876543221", "email": "bbq@nation.com", "opening_time": "12:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300", "description": "Live Barbecue", "rating": 4.8},
    {"name": "Theobroma", "cuisine": "Bakery", "location": "Bandra, Mumbai", "phone": "+91 9876543222", "email": "theobroma@bakery.com", "opening_time": "09:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "description": "Delicious brownies", "rating": 4.7},
    {"name": "Starbucks", "cuisine": "Cafe", "location": "Multiple Locations", "phone": "+91 9876543223", "email": "starbucks@coffee.com", "opening_time": "08:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "description": "Premium coffee", "rating": 4.6},
    {"name": "Cafe Coffee Day", "cuisine": "Cafe", "location": "Multiple Locations", "phone": "+91 9876543224", "email": "ccd@coffee.com", "opening_time": "08:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "description": "Coffee and snacks", "rating": 4.4},
    {"name": "McDonald's", "cuisine": "Fast Food", "location": "Multiple Locations", "phone": "+91 9876543225", "email": "mcd@burgers.com", "opening_time": "10:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", "description": "Burgers and fries", "rating": 4.5},
    {"name": "KFC", "cuisine": "Fast Food", "location": "Multiple Locations", "phone": "+91 9876543226", "email": "kfc@chicken.com", "opening_time": "11:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", "description": "Fried Chicken", "rating": 4.5},
    {"name": "Burger King", "cuisine": "Fast Food", "location": "Multiple Locations", "phone": "+91 9876543227", "email": "bk@burger.com", "opening_time": "11:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", "description": "Whopper burgers", "rating": 4.4},
    {"name": "Pizza Hut", "cuisine": "Fast Food", "location": "Multiple Locations", "phone": "+91 9876543228", "email": "pizzahut@pizza.com", "opening_time": "11:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300", "description": "Pan pizzas", "rating": 4.5},
    {"name": "Subway", "cuisine": "Fast Food", "location": "Multiple Locations", "phone": "+91 9876543229", "email": "subway@sandwich.com", "opening_time": "10:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", "description": "Fresh sandwiches", "rating": 4.3},
    {"name": "Tibetan Kitchen", "cuisine": "Tibetan", "location": "Majnu Ka Tila, Delhi", "phone": "+91 9876543230", "email": "tibetan@kitchen.com", "opening_time": "11:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "description": "Momos and Thukpa", "rating": 4.6},
    {"name": "Coastal Spice", "cuisine": "Seafood", "location": "Juhu, Mumbai", "phone": "+91 9876543231", "email": "coastal@spice.com", "opening_time": "12:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300", "description": "Fresh seafood", "rating": 4.7},
    {"name": "Sharma Chai Wala", "cuisine": "Tea & Snacks", "location": "Chandni Chowk, Delhi", "phone": "+91 9876543232", "email": "sharma@chai.com", "opening_time": "07:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300", "description": "Famous cutting chai", "rating": 4.5},
    {"name": "Indore Food Junction", "cuisine": "Street Food", "location": "Indore", "phone": "+91 9876543233", "email": "indore@food.com", "opening_time": "08:00", "closing_time": "23:00", "image": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300", "description": "Poha and Jalebi", "rating": 4.6},
    {"name": "Rajasthan Food House", "cuisine": "Rajasthani", "location": "Jaipur", "phone": "+91 9876543234", "email": "rajasthan@food.com", "opening_time": "11:00", "closing_time": "22:00", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "description": "Daal Baati Churma", "rating": 4.7},
]

# Working image URLs by cuisine (specific to food items)
FOOD_IMAGE_MAP = {
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300",
    "Dal Makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300",
    "Paneer Butter Masala": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300",
    "Rogan Josh": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Chicken Curry": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Tandoori Roti": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
    "Naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
    "Malai Kofta": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300",
    "Shahi Paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300",
    "Kadai Chicken": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Masala Dosa": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Idli Sambhar": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Vada": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Uttapam": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Medu Vada": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Rava Dosa": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Pongal": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Upma": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Bisibele Bath": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Lemon Rice": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Chicken Biryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300",
    "Mutton Biryani": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300",
    "Veg Biryani": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300",
    "Egg Biryani": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300",
    "Mirchi Ka Salan": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Double Ka Meetha": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Pani Puri": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Vada Pav": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Samosa": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Bhel Puri": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Sev Puri": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Dahi Puri": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Kachori": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Aloo Tikki": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Chicken Momos": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Veg Momos": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Amritsari Kulcha": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Chole Bhature": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Makki Di Roti": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300",
    "Sarson Da Saag": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300",
    "Lassi": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Butter Naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
    "Garlic Naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
    "Hakka Noodles": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Manchurian": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Fried Rice": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Chili Chicken": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Schezwan Noodles": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Spring Rolls": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Hot and Sour Soup": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Sweet Corn Soup": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Pizza Margherita": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300",
    "Paneer Pizza": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300",
    "Chicken Pizza": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300",
    "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "Cheeseburger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "French Fries": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "Chicken Popcorn": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "Wrap": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "Sandwich": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "Gulab Jamun": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Rasmalai": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Jalebi": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Ice Cream": "https://images.unsplash.com/photo-1570197788417-0e82375c9373?w=300",
    "Brownie": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300",
    "Cake": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Kulfi": "https://images.unsplash.com/photo-1570197788417-0e82375c9373?w=300",
    "Falooda": "https://images.unsplash.com/photo-1570197788417-0e82375c9373?w=300",
    "Rasgulla": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Laddu": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Masala Chai": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Filter Coffee": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Cold Coffee": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Mango Lassi": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Sweet Lassi": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Jaljeera": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Lemonade": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Buttermilk": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Fresh Lime Soda": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Thandai": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Energy Drink": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Hot Chocolate": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
}

# Default fallback images by cuisine
DEFAULT_IMAGES = {
    "North Indian": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "South Indian": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Hyderabadi": "https://images.unsplash.com/photo-1563379091339-03b21f4a2f48?w=300",
    "Street Food": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Punjabi": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300",
    "Chinese": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Fast Food": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    "Dessert": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Beverages": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Bengali Sweets": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Indian Sweets": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Cafe": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300",
    "Bakery": "https://images.unsplash.com/photo-1589301760014-929efae4d9aa?w=300",
    "Barbecue": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Seafood": "https://images.unsplash.com/photo-1588166524941-3bf61a9c34db?w=300",
    "Tibetan": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
    "Rajasthani": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
}

# Generate 200+ Food Items with proper matching images
def generate_food_items(restaurants):
    foods = []
    
    categories = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert", "Beverages", "Fast Food", "Chinese"]
    meal_types = ["breakfast", "lunch", "dinner", "snacks", "any"]
    mood_tags_list = [["happy"], ["sad"], ["energetic"], ["tired"], ["happy", "energetic"], ["sad", "happy"], ["normal"]]
    price_ranges = ["cheap", "medium", "expensive"]
    
    # Food name generators by cuisine
    food_names = {
        "North Indian": ["Butter Chicken", "Dal Makhani", "Paneer Butter Masala", "Rogan Josh", "Chicken Curry", "Naan", "Tandoori Roti", "Malai Kofta", "Shahi Paneer", "Kadai Chicken"],
        "South Indian": ["Masala Dosa", "Idli Sambhar", "Medu Vada", "Uttapam", "Rava Dosa", "Pongal", "Upma", "Bisibele Bath", "Lemon Rice", "Curd Rice"],
        "Hyderabadi": ["Chicken Biryani", "Mutton Biryani", "Veg Biryani", "Egg Biryani", "Mirchi Ka Salan", "Double Ka Meetha"],
        "Street Food": ["Pani Puri", "Vada Pav", "Pav Bhaji", "Samosa", "Bhel Puri", "Sev Puri", "Dahi Puri", "Kachori", "Aloo Tikki", "Chicken Momos", "Veg Momos"],
        "Punjabi": ["Amritsari Kulcha", "Chole Bhature", "Makki Di Roti", "Sarson Da Saag", "Lassi", "Butter Naan", "Garlic Naan"],
        "Chinese": ["Hakka Noodles", "Manchurian", "Fried Rice", "Chili Chicken", "Schezwan Noodles", "Spring Rolls", "Hot and Sour Soup", "Sweet Corn Soup"],
        "Fast Food": ["Pizza Margherita", "Paneer Pizza", "Chicken Pizza", "Burger", "Cheeseburger", "French Fries", "Chicken Popcorn", "Wrap", "Sandwich"],
        "Dessert": ["Gulab Jamun", "Rasmalai", "Jalebi", "Ice Cream", "Brownie", "Cake", "Kulfi", "Falooda", "Rasgulla", "Laddu"],
        "Beverages": ["Masala Chai", "Filter Coffee", "Cold Coffee", "Mango Lassi", "Sweet Lassi", "Jaljeera", "Lemonade", "Buttermilk", "Fresh Lime Soda", "Thandai", "Energy Drink", "Hot Chocolate"],
    }
    
    prices = {
        "cheap": [20, 30, 40, 50, 60, 70, 80],
        "medium": [90, 100, 120, 150, 180, 200, 220, 250],
        "expensive": [280, 300, 350, 400, 450, 500, 600]
    }
    
    for restaurant in restaurants:
        cuisine = restaurant["cuisine"]
        food_list = food_names.get(cuisine, food_names["Fast Food"])
        
        # Add 8-12 items per restaurant
        num_items = random.randint(8, 12)
        selected_foods = random.sample(food_list, min(num_items, len(food_list)))
        
        for food_name in selected_foods:
            category = random.choice(categories)
            meal_type = random.choice(meal_types)
            mood_tags = random.choice(mood_tags_list)
            price_range = random.choice(price_ranges)
            price = random.choice(prices[price_range])
            rating = round(random.uniform(4.0, 5.0), 1)
            
            # Get matching image for the food name, or fallback to cuisine default
            image = FOOD_IMAGE_MAP.get(food_name, DEFAULT_IMAGES.get(cuisine, DEFAULT_IMAGES["Fast Food"]))
            
            # Adjust price based on cuisine
            if cuisine in ["North Indian", "Hyderabadi"]:
                price = random.choice([180, 220, 250, 280, 320])
                price_range = "medium"
            elif cuisine in ["Street Food", "Snacks"]:
                price = random.choice([20, 30, 40, 50, 60])
                price_range = "cheap"
            
            foods.append({
                "name": food_name,
                "restaurant_id": "temp",  # Will be replaced after restaurant insertion
                "restaurant_name": restaurant["name"],
                "price": price,
                "image": image,
                "category": category,
                "rating": rating,
                "meal_type": meal_type,
                "mood_tags": mood_tags,
                "price_range": price_range,
                "is_available": True,
                "description": f"Delicious {food_name} from {restaurant['name']}. A must-try dish!",
                "created_at": datetime.utcnow()
            })
    
    return foods

async def insert_demo_data():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("🗑️ Clearing existing data...")
    await db.restaurants.delete_many({})
    await db.foods.delete_many({})
    await db.users.delete_many({"role": "restaurant"})
    
    print("🏪 Inserting restaurants...")
    restaurant_objects = []
    for rest in RESTAURANTS:
        rest_dict = {
            **rest,
            "password": get_password_hash("restaurant123"),
            "role": "restaurant",
            "is_active": True,
            "orders_completed": 0,
            "total_revenue": 0,
            "created_at": datetime.utcnow()
        }
        result = await db.restaurants.insert_one(rest_dict)
        rest_dict["_id"] = result.inserted_id
        restaurant_objects.append(rest_dict)
        print(f"   ✅ Added: {rest['name']}")
    
    print("\n🍕 Generating food items with matching images...")
    all_foods = generate_food_items(restaurant_objects)
    
    # Update restaurant_id for each food
    for food in all_foods:
        for restaurant in restaurant_objects:
            if food["restaurant_name"] == restaurant["name"]:
                food["restaurant_id"] = str(restaurant["_id"])
                break
    
    # Insert foods
    if all_foods:
        await db.foods.insert_many(all_foods)
        print(f"   ✅ Added {len(all_foods)} food items with matching images!")
    
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
        print("\n👑 Admin user created!")
        print("   Email: admin@foodiehub.com")
        print("   Password: admin123")
    
    # Create a regular user for testing
    user_exists = await db.users.find_one({"email": "user@test.com"})
    if not user_exists:
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
        print("\n👤 Test user created!")
        print("   Email: user@test.com")
        print("   Password: user123")
    
    # Print statistics
    restaurant_count = await db.restaurants.count_documents({})
    food_count = await db.foods.count_documents({})
    
    print("\n" + "="*50)
    print("📊 DATABASE STATISTICS")
    print("="*50)
    print(f"🏪 Restaurants: {restaurant_count}")
    print(f"🍕 Food Items: {food_count}")
    print(f"🍽️ Categories: Breakfast, Lunch, Dinner, Snacks, Dessert, Beverages, Fast Food, Chinese")
    print("="*50)
    
    # Restaurant credentials summary
    print("\n🔑 RESTAURANT LOGIN CREDENTIALS:")
    print("   Email: [restaurant email]")
    print("   Password: restaurant123")
    print("\n   Example restaurants:")
    for rest in RESTAURANTS[:5]:
        print(f"   - {rest['email']} / restaurant123")
    
    # Sample food images
    print("\n🖼️ SAMPLE FOOD IMAGES (Check if images are working):")
    sample_foods = await db.foods.find().limit(5).to_list(length=5)
    for food in sample_foods:
        print(f"   - {food['name']}: {food['image']}")
    
    client.close()
    print("\n✅ Demo data insertion complete!")

if __name__ == "__main__":
    asyncio.run(insert_demo_data())