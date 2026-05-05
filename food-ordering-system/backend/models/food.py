from pydantic import BaseModel
from typing import Optional

class Food(BaseModel):
    id: Optional[str] = None
    name: str
    price: float
    image: str
    category: str
    rating: float
    weather_tags: list = []
    mood_tags: list = []
    price_range: str

# Sample food data to insert
SAMPLE_FOODS = [
    {
        "name": "Chocolate Ice Cream",
        "price": 5.99,
        "image": "https://images.unsplash.com/photo-1570197788417-0e82375c9373?w=300",
        "category": "Dessert",
        "rating": 4.8,
        "weather_tags": ["hot"],
        "mood_tags": ["sad", "happy"],
        "price_range": "cheap"
    },
    {
        "name": "Hot Masala Chai",
        "price": 3.99,
        "image": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300",
        "category": "Beverages",
        "rating": 4.7,
        "weather_tags": ["cold", "rainy"],
        "mood_tags": ["tired", "sad"],
        "price_range": "cheap"
    },
    {
        "name": "Spicy Burger",
        "price": 12.99,
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
        "category": "Fast Food",
        "rating": 4.5,
        "weather_tags": ["hot"],
        "mood_tags": ["energetic", "happy"],
        "price_range": "medium"
    },
    {
        "name": "Fresh Fruit Smoothie",
        "price": 7.99,
        "image": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300",
        "category": "Beverages",
        "rating": 4.6,
        "weather_tags": ["hot"],
        "mood_tags": ["energetic", "happy"],
        "price_range": "cheap"
    },
    {
        "name": "Chicken Noodles Soup",
        "price": 10.99,
        "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300",
        "category": "Main Course",
        "rating": 4.7,
        "weather_tags": ["cold", "rainy"],
        "mood_tags": ["tired", "sad"],
        "price_range": "medium"
    },
    {
        "name": "Pizza Margherita",
        "price": 15.99,
        "image": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300",
        "category": "Fast Food",
        "rating": 4.9,
        "weather_tags": ["hot"],
        "mood_tags": ["happy", "energetic"],
        "price_range": "medium"
    },
    {
        "name": "Warm Brownie",
        "price": 6.99,
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300",
        "category": "Dessert",
        "rating": 4.8,
        "weather_tags": ["cold"],
        "mood_tags": ["sad", "happy"],
        "price_range": "cheap"
    },
    {
        "name": "Grilled Steak",
        "price": 24.99,
        "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=300",
        "category": "Main Course",
        "rating": 4.9,
        "weather_tags": ["cold"],
        "mood_tags": ["energetic", "happy"],
        "price_range": "expensive"
    }
]