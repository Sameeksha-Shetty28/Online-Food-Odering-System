from pydantic import BaseModel, Field


class FoodCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = ""
    price: float = Field(..., gt=0)
    image: str = ""
    category: str = Field(..., min_length=2, max_length=60)


class FoodUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = ""
    price: float = Field(..., gt=0)
    image: str = ""
    category: str = Field(..., min_length=2, max_length=60)


class FoodOut(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image: str
    category: str
    createdAt: object | None = None
