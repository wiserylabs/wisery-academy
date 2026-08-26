from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "date_joined"]
        read_only_fields = fields


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
