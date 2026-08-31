from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "date_joined"]
        read_only_fields = fields


class UserAdminSerializer(serializers.ModelSerializer):
    """Editor-only user management. Unlike SignupSerializer this DOES accept a
    role (an editor is trusted to set it) and a password. Passwords are stored
    hashed and can never be read back — `password` is write-only, and leaving
    it blank on an update keeps the existing one."""

    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "password", "is_active", "date_joined"]
        read_only_fields = ["id", "date_joined"]

    def create(self, validated_data):
        password = validated_data.pop("password", "") or ""
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "") or ""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "full_name", "password"]

    def create(self, validated_data):
        # role is deliberately not accepted from the request — see
        # UserManager.create_user(). Every sign-up is a Student until an
        # editor promotes them (in the admin, or a future "manage users"
        # screen in the Editor CMS).
        return User.objects.create_user(**validated_data)
