import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture(autouse=True)
def _media_root(settings, tmp_path):
    # Every test writes uploaded files to a throwaway per-test temp dir,
    # never into the project tree. (This is the exact mistake a manual
    # smoke test made earlier — leaking a real file into the repo — that
    # this fixture makes structurally impossible.)
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def make_user(db):
    def _make(email, role="student", password="testpass123", **kwargs):
        user = User.objects.create_user(email=email, password=password, **kwargs)
        if role != "student":
            user.role = role
            user.save(update_fields=["role"])
        return user

    return _make


@pytest.fixture
def student(make_user):
    return make_user("dana@wisery.test", role="student")


@pytest.fixture
def technical(make_user):
    return make_user("omer@wisery.test", role="technical")


@pytest.fixture
def editor(make_user):
    return make_user("maya@wisery.test", role="editor")


@pytest.fixture
def as_user(api_client):
    """api_client authenticated as the given user, via a real JWT — not
    force_authenticate — so at least the auth wiring is exercised too."""

    def _as(user, password="testpass123"):
        resp = api_client.post("/api/auth/login/", {"email": user.email, "password": password}, format="json")
        assert resp.status_code == 200, resp.data
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        return api_client

    return _as
