from django.db import models
from django.contrib.auth.hashers import make_password

class UserAuth(models.Model):
    username = models.CharField(max_length=255)
    fullname = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    