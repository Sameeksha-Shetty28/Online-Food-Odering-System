from pydantic import BaseModel
from typing import List, Optional

class CartItem(BaseModel):
    food_id: str
    quantity: int

class Cart(BaseModel):
    id: Optional[str] = None
    user_id: str
    items: List[CartItem] = []

class CartAddItem(BaseModel):
    food_id: str
    quantity: int = 1