from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserAuth
import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from datetime import timedelta

@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    body = json.loads(request.body)
    username = body.get("username")
    password = body.get("password")

    user = UserAuth.objects.filter(username=username).first()

    if user is None:
        return JsonResponse({"error": "User not found"}, status=404)

    if not check_password(password, user.password):
        return JsonResponse({"error": "Wrong password"}, status=401)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    response = JsonResponse({"message": "Login successful"}, status=200)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,     
        samesite="Lax",     
        max_age=3600        
    )

    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=False, 
        samesite="Lax",
        max_age=7*24*3600 
    )

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
    response = JsonResponse({"message": "Logged out"}, status=200)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@csrf_exempt
def protected_view(request):
    access_token = request.COOKIES.get("access_token")
    if not access_token:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(access_token)
        user = jwt_auth.get_user(validated_token)
    except Exception:
        return JsonResponse({"error": "Invalid or expired token"}, status=401)

    return JsonResponse({"message": f"Hello {user.username}, this is protected!"}, status=200)