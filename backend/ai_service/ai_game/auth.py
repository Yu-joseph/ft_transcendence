import os
import jwt
from flask import request
from dotenv import load_dotenv

load_dotenv("/vault/aii/apiss.env")
DJANGO_SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")


def get_user_id():

    token = request.cookies.get("access_token")

    if not token:
        return None

    if not DJANGO_SECRET_KEY:
        print("[JWT] Missing DJANGO_SECRET_KEY", flush=True)
        return None
    try:
        decoded = jwt.decode( token, DJANGO_SECRET_KEY, algorithms=["HS256"])
        return str(decoded.get("user_id"))

    except Exception as e:
        print(f"[JWT] Failed to decode token: {e}")
        return None