from datetime import datetime, timezone
from typing import Dict


def user_document(name: str, email: str, password: str, role: str = "user") -> Dict:
    return {
        "name": name,
        "email": email.lower(),
        "password": password,
        "role": role,
        "createdAt": datetime.now(timezone.utc),
    }


def user_response(user: Dict) -> Dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "createdAt": user.get("createdAt"),
    }
