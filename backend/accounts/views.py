from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from academy.permissions import IsEditor

from .serializers import SignupSerializer, UserAdminSerializer, UserSerializer

User = get_user_model()


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    """Editor-only CRUD for the in-app user management screen: list users,
    create them with a role and password, change roles, reset passwords, and
    delete accounts. Two self-inflicted foot-guns are blocked so an editor
    can't lock themselves out."""

    queryset = User.objects.all().order_by("email")
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditor]

    def perform_update(self, serializer):
        instance = serializer.instance
        new_role = serializer.validated_data.get("role", instance.role)
        if instance == self.request.user and new_role != instance.role:
            raise ValidationError("You can't change your own role — ask another editor to do it.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError("You can't delete your own account.")
        instance.delete()
