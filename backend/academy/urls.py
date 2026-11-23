from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import FileAssetViewSet, LearnerProgressView, SiteSettingsView, TrackViewSet

router = DefaultRouter()
router.register("tracks", TrackViewSet, basename="track")
router.register("files", FileAssetViewSet, basename="file")

urlpatterns = [
    path("settings/", SiteSettingsView.as_view(), name="settings"),
    path("learners/<int:user_id>/progress/", LearnerProgressView.as_view(), name="learner-progress"),
] + router.urls
