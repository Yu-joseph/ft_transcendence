import os
import jwt
from flask import request




def get_user_id():
    token = request.cookies.get('access_token')
    if not token:
        # return request.remote_addr 
        return None
    try:
        decoded = jwt.decode(token, os.getenv('DJANGO_SECRET_KEY'), algorithms=['HS256'])
        return str(decoded.get('user_id'))
    except Exception as e:
        print(f"[JWT] Failed to decode token: {e}")
        # return request.remote_addr 
        return None
    


