from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import FileAssetViewSet, SiteSettingsView, TrackViewSet

router = DefaultRouter()
router.register("tracks", TrackViewSet, basename="track")
router.register("files", FileAssetViewSet, basename="file")

urlpatterns = [
    path("settings/", SiteSettingsView.as_view(), name="settings"),
] + router.urls
