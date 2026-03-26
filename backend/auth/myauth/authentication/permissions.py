from django.http import JsonResponse
from .auth_utils import get_user_from_request


def role_required(allowed_roles):

    def decorator(view_func):

        def wrapper(request, *args, **kwargs):

            user = get_user_from_request(request)

            if not user:
                return JsonResponse({"error": "Authentication required"}, status=401)

            if not user.is_active:
                return JsonResponse({"error": "Account inactive"}, status=403)

            if user.role not in allowed_roles:
                return JsonResponse({"error": "Forbidden"}, status=403)

            request.user = user

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator