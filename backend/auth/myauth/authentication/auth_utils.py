from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.http import JsonResponse
from .models import User


def get_user_from_request(request):

    token = request.COOKIES.get("access_token")

    if not token:
        return None

    try:
        access = AccessToken(token)

        user_id = access["user_id"]

        user = User.objects.filter(id=user_id).first()

        return user

    except TokenError:
        return None