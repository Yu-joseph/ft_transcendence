from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from .models import UserAuth
import json

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

    return JsonResponse({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }, status=200)

@csrf_exempt
def register(request):
    if request.method == "POST":
        body = json.loads(request.body)

        username = body.get("username")
        fullname = body.get("fullname")

        user = UserAuth.objects.filter(
            username=username,
            fullname=fullname
        ).first()
        if user :
            
        else :
            return HttpResponse(username)
    return HttpResponse("dor 9awd")