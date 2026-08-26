import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserManager:
    def test_create_user_defaults_to_student(self):
        user = User.objects.create_user(email="dana@wisery.test", password="pw-12345678")
        assert user.role == "student"

    def test_create_user_cannot_be_escalated_via_role_kwarg(self):
        """Regression test: create_user() used to setdefault() the role,
        so a direct call with role="editor" would slip through. The public
        sign-up API never exposes `role` (see SignupSerializer), but the
        manager must refuse to trust it even when called directly."""
        user = User.objects.create_user(email="dana@wisery.test", password="pw-12345678", role="editor")
        assert user.role == "student"

    def test_create_user_hashes_the_password(self):
        user = User.objects.create_user(email="dana@wisery.test", password="pw-12345678")
        assert user.password != "pw-12345678"
        assert user.check_password("pw-12345678")

    def test_create_user_requires_email(self):
        with pytest.raises(ValueError):
            User.objects.create_user(email="", password="pw-12345678")

    def test_create_superuser_is_editor_staff_and_superuser(self):
        user = User.objects.create_superuser(email="maya@wisery.test", password="pw-12345678")
        assert user.role == "editor"
        assert user.is_staff is True
        assert user.is_superuser is True


@pytest.mark.django_db
class TestSignupEndpoint:
    def test_signup_creates_a_student(self, api_client):
        resp = api_client.post(
            "/api/auth/signup/",
            {"email": "dana@wisery.test", "full_name": "Dana Levi", "password": "pw-12345678"},
            format="json",
        )
        assert resp.status_code == 201, resp.data
        user = User.objects.get(email="dana@wisery.test")
        assert user.role == "student"

    def test_signup_response_never_includes_the_password(self, api_client):
        resp = api_client.post(
            "/api/auth/signup/",
            {"email": "dana@wisery.test", "full_name": "Dana Levi", "password": "pw-12345678"},
            format="json",
        )
        assert "password" not in resp.data

    def test_signup_rejects_a_short_password(self, api_client):
        resp = api_client.post(
            "/api/auth/signup/",
            {"email": "dana@wisery.test", "password": "short"},
            format="json",
        )
        assert resp.status_code == 400

    def test_signup_rejects_a_duplicate_email(self, api_client, student):
        resp = api_client.post(
            "/api/auth/signup/",
            {"email": student.email, "password": "pw-12345678"},
            format="json",
        )
        assert resp.status_code == 400


@pytest.mark.django_db
class TestLoginAndMe:
    def test_login_then_me_round_trip(self, api_client, student):
        login = api_client.post(
            "/api/auth/login/", {"email": student.email, "password": "testpass123"}, format="json"
        )
        assert login.status_code == 200
        assert "access" in login.data and "refresh" in login.data

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        me = api_client.get("/api/auth/me/")
        assert me.status_code == 200
        assert me.data["email"] == student.email
        assert me.data["role"] == "student"

    def test_login_rejects_wrong_password(self, api_client, student):
        resp = api_client.post(
            "/api/auth/login/", {"email": student.email, "password": "wrong-password"}, format="json"
        )
        assert resp.status_code == 401

    def test_me_requires_authentication(self, api_client):
        resp = api_client.get("/api/auth/me/")
        assert resp.status_code == 401
