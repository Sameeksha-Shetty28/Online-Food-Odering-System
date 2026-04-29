from fastapi import APIRouter, Depends

from app.controllers.cart_controller import (
    add_cart_item_for_user,
    add_to_cart,
    clear_cart_by_user_id,
    get_cart_by_user_id,
    get_user_cart,
    remove_from_cart,
    update_cart_by_user_id,
)
from app.schemas.cart_schema import CartItemIn, CartRemoveIn
from app.utils.jwt_handler import get_current_user


router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.get("")
async def read_cart(current_user=Depends(get_current_user)):
    return await get_user_cart(current_user)


@router.post("/add")
async def add_cart_item(item: CartItemIn, current_user=Depends(get_current_user)):
    return await add_to_cart(item, current_user)


@router.delete("/remove")
async def remove_cart_item(item: CartRemoveIn, current_user=Depends(get_current_user)):
    return await remove_from_cart(item, current_user)


@router.get("/{userId}")
async def read_cart_by_user_id(userId: str):
    return await get_cart_by_user_id(userId)


@router.post("")
async def add_cart_item_public(cart_data: dict):
    return await add_cart_item_for_user(cart_data)


@router.put("/{userId}")
async def update_cart_public(userId: str, cart_data: dict):
    return await update_cart_by_user_id(userId, cart_data)


@router.delete("/{userId}")
async def clear_cart_public(userId: str):
    return await clear_cart_by_user_id(userId)
