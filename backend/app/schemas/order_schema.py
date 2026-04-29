from typing import Literal

from pydantic import BaseModel


class OrderItemOut(BaseModel):
    foodId: str
    quantity: int
    price: float


class OrderOut(BaseModel):
    id: str
    userId: str
    items: list[OrderItemOut]
    totalAmount: float
    status: Literal["Placed", "Preparing", "Delivered", "pending", "preparing", "delivered"]
    createdAt: object | None = None


class OrderStatusUpdate(BaseModel):
    status: Literal["Placed", "Preparing", "Delivered", "pending", "preparing", "delivered"]
