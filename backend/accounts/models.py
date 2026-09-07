from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class Role(models.TextChoices):
    STUDENT = "student", "Student"
    TECHNICAL = "technical", "Technical"
    EDITOR = "editor", "Editor"


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["email"]

    def __str__(self):
        return self.email

    @property
    def is_technical_or_above(self):
        return self.role in (Role.TECHNICAL, Role.EDITOR)

    @property
    def is_editor(self):
        return self.role == Role.EDITOR
