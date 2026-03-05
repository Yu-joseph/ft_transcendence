from django.db import models

class UserAuth(models.Model):

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("moderator", "Moderator"),
        ("user", "User"),
        ("guest", "Guest"),
    ]

    username = models.CharField(max_length=255, unique=True)
    fullname = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="user"
    )

    is_active = models.BooleanField(default=True)