# Food Ordering System Backend

FastAPI backend for the React Food Ordering System using MongoDB, PyMongo, JWT authentication, and bcrypt password hashing.

## Setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start MongoDB locally:

```bash
mongod
```

4. Run the backend server:

```bash
python run.py
```

Backend URL:

```text
http://127.0.0.1:8000
```

Interactive API docs:

```text
http://127.0.0.1:8000/docs
```

## Environment

The `.env` file is already included for local development:

```env
MONGO_URI=mongodb://localhost:27017
SECRET_KEY=change-this-secret-key-before-production
```

Change `SECRET_KEY` before using this outside local development.

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <token>
```

## Sample Requests And Responses

### Register

`POST /api/auth/register`

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": "mongo-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-04-29T04:25:00Z"
  }
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Create Food

`POST /api/foods` admin only

```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce and mozzarella.",
  "price": 299,
  "image": "https://example.com/pizza.jpg",
  "category": "Pizza"
}
```

### Add To Cart

`POST /api/cart/add`

```json
{
  "foodId": "mongo-food-id",
  "quantity": 2
}
```

### Place Order

`POST /api/orders`

Response:

```json
{
  "message": "Order placed successfully",
  "order": {
    "id": "mongo-order-id",
    "userId": "mongo-user-id",
    "items": [
      {
        "foodId": "mongo-food-id",
        "quantity": 2,
        "price": 299
      }
    ],
    "totalAmount": 598,
    "status": "pending",
    "createdAt": "2026-04-29T04:25:00Z"
  }
}
```

### Update Order Status

`PUT /api/orders/{id}/status` admin only

```json
{
  "status": "preparing"
}
```

## Endpoint Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/foods`
- `POST /api/foods`
- `PUT /api/foods/{id}`
- `DELETE /api/foods/{id}`
- `GET /api/cart`
- `POST /api/cart/add`
- `DELETE /api/cart/remove`
- `POST /api/orders`
- `GET /api/orders/user`
- `GET /api/orders`
- `PUT /api/orders/{id}/status`
- `GET /api/users`
- `DELETE /api/users/{id}`
