from rest_framework.routers import DefaultRouter

from .views import FileAssetViewSet, TrackViewSet

router = DefaultRouter()
router.register("tracks", TrackViewSet, basename="track")
router.register("files", FileAssetViewSet, basename="file")

urlpatterns = router.urls
