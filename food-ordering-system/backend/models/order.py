from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    food_id: str
    name: str
    price: float
    quantity: int

class Order(BaseModel):
    id: Optional[str] = None
    user_id: str
    items: List[OrderItem]
    total_price: float
    status: str = "pending"
    created_at: datetime = datetime.utcnow()

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_price: float