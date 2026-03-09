from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.http import JsonResponse
from .models import UserAuth
from .permissions import role_required  
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
                password=hashed_password,
                fullname="",
                role="admin"
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

def protected_view(request):

    token = request.COOKIES.get("access_token")

    if not token:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        access = AccessToken(token)

        user_id = access["user_id"]

    except TokenError:
        return JsonResponse({"error": "Invalid token"}, status=401)

    return JsonResponse({"message": "Authorized", "user_id": user_id})


@role_required(["admin"])
def list_users(request):

    users = UserAuth.objects.all().values("id", "username", "role")

    return JsonResponse(list(users), safe=False)

@role_required(["admin"])
def delete_user(request, user_id):

    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)

    user = UserAuth.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.delete()

    return JsonResponse({"message": "User deleted"})

@role_required(["admin"])
def update_user(request, user_id):

    if request.method != "PATCH":
        return JsonResponse({"error": "PATCH required"}, status=405)

    body = json.loads(request.body)

    user = UserAuth.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.fullname = body.get("fullname", user.fullname)
    user.role = body.get("role", user.role)

    user.save()

    return JsonResponse({"message": "User updated"})

@role_required(["admin", "moderator"])
def deactivate_user(request, user_id):

    user = UserAuth.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.is_active = False
    user.save()

    return JsonResponse({"message": "User banned"})                  

@role_required(["admin"])
def change_user_role(request, user_id):

    if request.method != "PATCH":
        return JsonResponse({"error": "PATCH required"}, status=405)

    body = json.loads(request.body)

    new_role = body.get("role")

    if not new_role:
        return JsonResponse({"error": "Role required"}, status=400)

    user = UserAuth.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.role = new_role
    user.save()

    return JsonResponse({"message": "Role updated"})

@role_required(["admin", "moderator"])
def get_user(request, user_id):

    user = UserAuth.objects.filter(id=user_id).values(
        "id", "username", "fullname", "role", "is_active"
    ).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    return JsonResponse(user)