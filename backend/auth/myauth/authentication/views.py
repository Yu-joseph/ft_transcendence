from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import UserAuth
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
from django.middleware import csrf
import json

@csrf_exempt
def login(request):

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    body = json.loads(request.body)
    username = body.get("username")
    password = body.get("password")

    # Using a custom UserAuth model (not Django's auth User), so
    # `authenticate()` won't find users. Manually verify credentials.
    user = UserAuth.objects.filter(username=username).first()

    if not user:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    if not check_password(password, user.password):
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    if getattr(user, "is_active", True) is False:
        return JsonResponse({"error": "Account inactive"}, status=403)

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    response = JsonResponse({"message": "Login successful"})

    response.set_cookie(
        key="access_token",
        value=str(access),
        max_age=300,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        max_age=604800,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )

    csrf.get_token(request)

    return response

@csrf_exempt
def register(request):

    if request.method == "POST":

        body = json.loads(request.body)

        username = body.get("username")
        password = body.get("password")

        user = UserAuth.objects.filter(username=username).first()

        if not user:

            tmp_user = UserAuth(username=username)

            try:
                validate_password(password, user=tmp_user)
            except ValidationError as e:
                return JsonResponse({
                    "error": e.messages
                }, status=400)

            hashed_password = make_password(password)

            UserAuth.objects.create(
                username=username,
                password=hashed_password
            )

            return JsonResponse({"message": "User created"}, status=201)

        else:
            return JsonResponse({
                "error": "User already exists"
            }, status=400)

    return JsonResponse({"error": "POST required"}, status=405)

@csrf_exempt
def logout(request):
    response = JsonResponse({"message": "Logged out"})

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return response
