"""
Settings for running the test suite — no live Postgres or S3/MinIO
required. Everything else (models, permissions, URLs) is exercised for
real; only the two external services are swapped for in-process
equivalents, the same way they'd swap between environments in production.
"""
from .settings import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

# MD5 is deliberately weak — fine for tests, wrong everywhere else. Argon2
# stays first in every real environment (see settings.py).
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
