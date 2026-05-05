from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.views.decorators.http import require_POST
from django.core.files.storage import default_storage
from rest_framework_simplejwt.exceptions import TokenError
from .auth_utils import get_user_from_request
from .permissions import role_required
import uuid
import requests
from .models import User
import json
import os
from PIL import Image

FORTY_TWO_AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
FORTY_TWO_TOKEN_URL     = 'https://api.intra.42.fr/oauth/token'
FORTY_TWO_USER_URL      = 'https://api.intra.42.fr/v2/me'

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
    else:
        return JsonResponse({"error": "username or email required"}, status=400)

    if not user:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    if not check_password(password, user.password):
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)
    access  = refresh.access_token

    response = JsonResponse({"message": "Login successful"})
    response.set_cookie(key="access_token",  value=str(access),  max_age=settings.ACCESS_TOKEN_COOKIE_MAX_AGE,    httponly=True, secure=True, samesite="Lax", path="/")
    response.set_cookie(key="refresh_token", value=str(refresh), max_age=settings.REFRESH_TOKEN_COOKIE_MAX_AGE, httponly=True, secure=True, samesite="Lax", path="/")
    return response


@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    content_type = request.content_type or ""
    if "application/json" in content_type:
        try:
            body     = json.loads(request.body)
            username = body.get("username")
            password = body.get("password")
            email    = body.get("email")
            fullname = body.get("fullname", "")
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

    if not username or not password:
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

    if not all(part.isalpha() for part in fullname.split()):
        return JsonResponse({"error": "Invalid name"}, status=400)
    if len(username) > 25:
         return JsonResponse({"error": "Invalid username"}, status=400)
    if len(email) > 42:
        return JsonResponse({"error": "Invalid email"}, status=400)
    if len(fullname) > 25:
        return JsonResponse({"error": "Invalid fullname"}, status=400)
    User.objects.create(
        id=str(uuid.uuid4()),
        username=username,
        email=email,
        password=make_password(password),
        fullname=fullname,
        role="user"
    )
    return JsonResponse({"message": "User created"}, status=201)


@csrf_exempt
def changing_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    tmp_user = get_user_from_request(request)
    if not tmp_user:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    try:
        body            = json.loads(request.body)
        curr_pass       = body.get("current_pass")
        new_pass        = body.get("new_pass")
        retype_new_pass = body.get("retype_new_pass")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not curr_pass or not new_pass or not retype_new_pass:
        return JsonResponse({"error": "All fields are required"}, status=400)

    if not check_password(curr_pass, tmp_user.password):
        return JsonResponse({"error": "Incorrect current password"}, status=400)

    if new_pass != retype_new_pass:
        return JsonResponse({"error": "New passwords do not match"}, status=400)

    try:
        validate_password(new_pass, tmp_user)
    except ValidationError as e:
        return JsonResponse({"error": e.messages}, status=400)

    tmp_user.password = make_password(new_pass)
    tmp_user.save()
    return JsonResponse({"message": "Password updated"}, status=200)


@csrf_exempt
def update_users(request):
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    tmp_user = get_user_from_request(request)
    if not tmp_user:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    fields_to_update = []
    try:
        body = json.loads(request.body)
        email    = body.get("email", "").strip()
        bio      = body.get("bio", "").strip()
        fullname = body.get("fullname", "").strip()
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON"}, status=401)

    if not email and not bio and not fullname:
        return JsonResponse({"No changes": "No fields to update"}, status=200)

    if email:
        validator = EmailValidator()
        try:
            validator(email)
        except ValidationError:
            return JsonResponse({"error": "Invalid email"}, status=400)
        tmp_user.email = email
        fields_to_update.append("email")

    if fullname:
        if not all(part.replace("-", "").isalpha() for part in fullname.split()):
            return JsonResponse({"error": "Invalid name"}, status=400)
        tmp_user.fullname = fullname
        fields_to_update.append("fullname")

    if bio:
        tmp_user.bio = bio
        fields_to_update.append("bio")

    tmp_user.save(update_fields=fields_to_update)
    return JsonResponse({"message": "profile updated", "email": tmp_user.email, "fullname": tmp_user.fullname, "bio": tmp_user.bio}, status=200)

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
        return JsonResponse({"message": "Authentication required"})

    try:
        access  = AccessToken(token)
        user_id = access["user_id"]
    except TokenError:
        return JsonResponse({"message": "Invalid token"})

    return JsonResponse({"message": "Authorized", "user_id": user_id})


@api_view(['GET'])
@permission_classes([AllowAny])
def forty_two_login(request):
    params = (
        f'?client_id={settings.SOCIAL_AUTH_42_KEY}'
        f'&redirect_uri={settings.FORTY_TWO_REDIRECT_URI}'
        f'&response_type=code'
    )
    return redirect(FORTY_TWO_AUTHORIZE_URL + params)


@csrf_exempt
def forty_two_callback(request):
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'No code provided'}, status=400)

    token_response = requests.post(FORTY_TWO_TOKEN_URL, data={
        'grant_type':    'authorization_code',
        'client_id':     settings.SOCIAL_AUTH_42_KEY,
        'client_secret': settings.SOCIAL_AUTH_42_SECRET,
        'code':          code,
        'redirect_uri':  settings.FORTY_TWO_REDIRECT_URI,
    })
    if token_response.status_code != 200:
        return JsonResponse({'error': 'Failed to get access token'}, status=400)

    access_token = token_response.json().get('access_token')

    user_response = requests.get(FORTY_TWO_USER_URL, headers={
        'Authorization': f'Bearer {access_token}'
    })
    if user_response.status_code != 200:
        return JsonResponse({'error': 'Failed to get user info'}, status=400)

    user_data = user_response.json()

    user = User.objects.filter(username=user_data['login']).first()
    if not user:
        user = User.objects.filter(email=user_data.get('email')).first()

    if not user:
        avatar_url = (
            user_data.get('image', {}).get('link') or
            user_data.get('image', {}).get('versions', {}).get('medium', '')
        )
        user = User.objects.create(
            id=str(uuid.uuid4()),
            username=user_data['login'],
            email=user_data.get('email', ''),
            fullname=f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
            role='user',
            avatar=avatar_url,
        )
        redirect_url = "/ChangeIntra"
    else:
        redirect_url = "/Dashboard"

    refresh = RefreshToken.for_user(user)
    access  = refresh.access_token

    response = redirect(redirect_url)
    response.set_cookie(key='access_token',  value=str(access),  max_age=604800,    httponly=True, secure=True, samesite='Lax', path='/')
    response.set_cookie(key='refresh_token', value=str(refresh), max_age=604800, httponly=True, secure=True, samesite='Lax', path='/')
    return response

@csrf_exempt
def password_42(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    tmp_user = get_user_from_request(request)
    if not tmp_user:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    try:
        body     = json.loads(request.body)
        password    = body.get("password")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON"}, status=400)
    
    try:
        validate_password(password, user=tmp_user)
    except ValidationError as e:
        return JsonResponse({"error": e.messages}, status=400)

    tmp_user.password = make_password(password)
    tmp_user.save()
    return JsonResponse({"message": "password added"}, status=201)

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

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}

def is_valid_image(file):
    try:
        file.seek(0)
        img = Image.open(file)
        img.verify()  
        file.seek(0)   
        img = Image.open(file)
        img.load()
        file.seek(0)
        return True
    except Exception as e:
        # Check your terminal/server logs for this output!
        print(f"DEBUG: Image validation failed with error: {e}")
        return False


@require_POST
@csrf_exempt
def update_avatar(request):
    try:
        avatar_file = request.FILES.get("avatar")
        if not avatar_file:
            return JsonResponse({"error": "avatar file is required"}, status=400)

        tmp_user = get_user_from_request(request)

        if not tmp_user:
           return JsonResponse({"error": "unauthorized user"}, status=401)

        ext = os.path.splitext(avatar_file.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return JsonResponse(
                {"error": f"Invalid file type '{ext}'"},
                status=400
            )
        if avatar_file.content_type not in ALLOWED_MIME_TYPES:
            return JsonResponse(
                {"error": f"Invalid MIME type '{avatar_file.content_type}'"},
                status=400
            )

        if avatar_file.size > 2 * 1024 * 1024:
            return JsonResponse({"error": "File too large"}, status=400)

        
        if not is_valid_image(avatar_file):
            return JsonResponse({"error": "Invalid image"}, status=400)


        if tmp_user.avatar and tmp_user.avatar.name != "images/pipi.jpg":
            if default_storage.exists(tmp_user.avatar.name):
                default_storage.delete(tmp_user.avatar.name)

        tmp_user.avatar = avatar_file
        tmp_user.save()

        return JsonResponse({
            "message": "Avatar updated successfully",
            "url": tmp_user.avatar.url
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": "Internal server error"}, status=500)
