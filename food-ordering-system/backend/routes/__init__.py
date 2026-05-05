from .auth import router
from .foods import router as foods_router
from .cart import router as cart_router
from .orders import router as orders_router
from .recommend import router as recommend_router

# Export routers directly
auth_router = router
foods_router = foods_router
cart_router = cart_router
orders_router = orders_router
recommend_router = recommend_router