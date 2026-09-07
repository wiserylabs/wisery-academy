from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    # Target for an AWS ALB health check, or a quick local sanity check.
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("academy.urls")),
]
