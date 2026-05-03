from django.urls import path
from . import views

urlpatterns = [
    path('login/',             views.login,              name='login'),
    path('register/',          views.register,           name='register'),
    path('logout/',            views.logout,             name='logout'),
    path('update_users/',            views.update_users,       name='update'),
    path('changepass/',   views.changing_password,  name='change-password'),
    path('getuser/',                views.get_user,           name='get-user'),
    path('42/login/',          views.forty_two_login,    name='42-login'),
    path('42/callback/',       views.forty_two_callback, name='42-callback'),
    path('update_avatar/',    views.update_avatar, name='update_avatar'),
    path('protected/', views.protected_view, name='protected_view'),
    #youssseeeef chouf fya hani hna
    # myaawww =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    path('42/password/',       views.password_42, name='password_42'),
]