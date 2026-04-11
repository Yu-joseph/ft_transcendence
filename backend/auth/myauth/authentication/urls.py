from django.urls import path
from . import views

urlpatterns = [
    path('login/',             views.login,              name='login'),
    path('register/',          views.register,           name='register'),
    path('logout/',            views.logout,             name='logout'),
    path('update/',            views.update_users,       name='update'),
    path('change-password/',   views.changing_password,  name='change-password'),
    path('me/',                views.get_user,           name='get-user'),
    path('42/login/',          views.forty_two_login,    name='42-login'),
    path('42/callback/',       views.forty_two_callback, name='42-callback'),
]