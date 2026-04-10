from django.urls import path
from . import views

urlpatterns = [

    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
    path("protected/", views.protected_view, name="protected"),
    path("getuser/", views.get_user, name="get_user"),
    path("update_users/", views.update_users, name="update_users"),
    path("changepass/", views.changing_password, name="changing_password"),
    
    # path("users/", views.list_users, name="list_users"),
    # path("users/<int:user_id>/delete/", views.delete_user, name="delete_user"),
    # path("users/<int:user_id>/role/", views.change_user_role, name="change_user_role"),

]