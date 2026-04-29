from fastapi import APIRouter, Body, Depends, status

from app.controllers.order_controller import (
    create_order,
    get_all_orders,
    get_orders_by_user_id,
    get_user_orders,
    update_order_status,
)
from app.schemas.order_schema import OrderStatusUpdate
from app.utils.jwt_handler import get_current_admin, get_current_user


router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def place_order(order: dict = Body(...)):
    return await create_order(order)


@router.get("/user")
async def read_user_orders(current_user=Depends(get_current_user)):
    return await get_user_orders(current_user)


@router.get("")
async def read_all_orders(_admin=Depends(get_current_admin)):
    return await get_all_orders()


@router.get("/{userId}")
async def read_orders_by_user_id(userId: str):
    return await get_orders_by_user_id(userId)


@router.put("/{id}/status")
async def change_order_status(id: str, status_data: OrderStatusUpdate, _admin=Depends(get_current_admin)):
    return await update_order_status(id, status_data)
