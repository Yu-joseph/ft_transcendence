from django.urls import path
from . import views

urlpatterns = [

    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
    path("protected/", views.protected_view, name="protected"),
    path("users/", views.list_users, name="list_users"),
    path("getuser/", views.get_user, name="get_user"),
    path("users/<int:user_id>/update/", views.update_user, name="update_user"),
    path("users/<int:user_id>/delete/", views.delete_user, name="delete_user"),
    path("users/<int:user_id>/role/", views.change_user_role, name="change_user_role"),

]