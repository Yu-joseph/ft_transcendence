from django.views.decorators.csrf import csrf_exempt
from .auth_utils import get_user_from_request
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.http import JsonResponse
from .models import User
from .permissions import role_required  
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.views.decorators.http import require_GET
from django.contrib.auth.hashers import check_password
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
import uuid
from django.middleware import csrf
from django.core.validators import validate_email
from django.core.validators import EmailValidator
import json

@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    content_type = request.content_type or ""
    if "application/json" in content_type:
        try:
            body     = json.loads(request.body)
            username = body.get("username")
            email    = body.get("email")
            password = body.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid JSON"}, status=400)
    else:
        username = request.POST.get("username")
        password = request.POST.get("password")
        email    = request.POST.get("email")
    
    if not password:
            return JsonResponse({"error": "password required"}, status=400)

    if email:
        validator = EmailValidator()
        try:
            validator(email)
        except ValidationError:
            return JsonResponse({"error": "Invalid Email"}, status=400)
        user = User.objects.filter(email=email).first()

    elif username:
        user = User.objects.filter(username=username).first()
    
    if not user:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    if not check_password(password, user.password):
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)
    access  = refresh.access_token

    response = JsonResponse({"message": "Login successful"})
    response.set_cookie(key="access_token",  value=str(access),  max_age=600,    httponly=True, secure=False, samesite="Lax", path="/")
    response.set_cookie(key="refresh_token", value=str(refresh), max_age=604800, httponly=True, secure=False, samesite="Lax", path="/")
    return response

@csrf_exempt
def register(request):
    if request.method == "POST":
        
        content_type = request.content_type or ""
        if "application/json" in content_type:
            try:
                body     = json.loads(request.body)
                username = body.get("username")
                password = body.get("password")
                email    = body.get("email")
                fullname = body.get("fullname")
                
            except json.JSONDecodeError:
                return JsonResponse({"error": "invalid JSON"}, status=400)
        else:
            username = request.POST.get("username")
            email    = request.POST.get("email")
            password = request.POST.get("password")
            fullname = request.POST.get("fullname", "")

        if not email:
            return JsonResponse({"error": "Email required"}, status=400)

        validator = EmailValidator()
        try:
            validator(email)
        except ValidationError:
            return JsonResponse({"error": "Invalid Email"}, status=400)

        if not username or not password or not email:
            return JsonResponse({"error": "username, email and password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists"}, status=400)

        tmp_user = User(username=username)
        try:
            validate_password(password, user=tmp_user)
        except ValidationError as e:
            return JsonResponse({"error": e.messages}, status=400)

        hashed_password = make_password(password)

        new_user = User.objects.create(
            id=str(uuid.uuid4()), 
            username=username,
            email=email,
            password=hashed_password,
            fullname=fullname,
            role="user"
        )
        avatar = request.FILES.get("avatar")
        if avatar:
            new_user.avatar = avatar 
        new_user.save()  

        return JsonResponse({
            "message": "User created"
        }, status=201)

    return JsonResponse({"error": "POST required"}, status=405)

@csrf_exempt
def logout(request):
    tmp_user = get_user_from_request(request)

    if tmp_user:
        tmp_user.status = "offline"
        tmp_user.save()
        response = JsonResponse({"message": "Logged out"})
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")

    else:
        response = JsonResponse({"error": "invalid token or user"})

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

@require_GET
@csrf_exempt
@role_required(["admin"])
def list_users(request):
    users = list(User.objects.all().values("id", "username", "role"))
    return JsonResponse({"success": True, "data": users})

@role_required(["admin"])
def delete_user(request, user_id):

    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)

    user = User.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.delete()

    return JsonResponse({"message": "User deleted"})

@role_required(["admin"])
def update_user(request, user_id):

    if request.method != "PATCH":
        return JsonResponse({"error": "PATCH required"}, status=405)

    body = json.loads(request.body)

    user = User.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.fullname = body.get("fullname", user.fullname)
    user.role = body.get("role", user.role)

    user.save()

    return JsonResponse({"message": "User updated"})

@role_required(["admin", "moderator"])
def deactivate_user(request, user_id):

    user = User.objects.filter(id=user_id).first()

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

    user = User.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    user.role = new_role
    user.save()

    return JsonResponse({"message": "Role updated"})

@csrf_exempt
def get_user(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    tmp_user = get_user_from_request(request)
    if not tmp_user:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    user = User.objects.filter(id=tmp_user.id).values( 
         "username", "fullname", "avatar", "id", "email"
    ).first()

    if not user:
        return JsonResponse({"error": "User not found"}, status=404)

    return JsonResponse(user)