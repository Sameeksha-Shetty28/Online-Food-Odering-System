from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal["user", "admin"] = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["user", "admin"]
    createdAt: object | None = None

