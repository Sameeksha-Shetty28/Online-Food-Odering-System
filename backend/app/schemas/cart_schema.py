from pydantic import BaseModel, Field


class CartItemIn(BaseModel):
    foodId: str
    quantity: int = Field(..., gt=0)


class CartRemoveIn(BaseModel):
    foodId: str


class CartItemOut(BaseModel):
    foodId: str
    quantity: int


class CartOut(BaseModel):
    id: str
    userId: str
    items: list[CartItemOut]

