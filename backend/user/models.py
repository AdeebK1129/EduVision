from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model that extends AbstractUser.
    Add any additional fields as needed.
    """
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username
