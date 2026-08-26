from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AuditLog, FileAsset, FileProgress, Track
from .permissions import CanViewFile, IsEditor
from .serializers import FileAssetSerializer, TrackSerializer


def log_action(request, action_name, obj):
    AuditLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action=action_name,
        target_type=obj.__class__.__name__,
        target_id=str(obj.pk),
        ip_address=request.META.get("REMOTE_ADDR"),
    )


class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [permissions.IsAuthenticated]


class FileAssetViewSet(viewsets.ModelViewSet):
    serializer_class = FileAssetSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewFile]

    def get_queryset(self):
        user = self.request.user
        qs = FileAsset.objects.select_related("track", "uploaded_by")
        track_id = self.request.query_params.get("track")
        if track_id:
            qs = qs.filter(track_id=track_id)

        if user.is_editor:
            return qs  # editors see drafts too, from every visibility tier

        qs = qs.filter(status="published")
        if user.is_technical_or_above:
            return qs.exclude(visibility="editors_only")
        return qs.filter(visibility="all")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "publish"):
            return [permissions.IsAuthenticated(), IsEditor()]
        return super().get_permissions()

    def perform_create(self, serializer):
        instance = serializer.save(
            uploaded_by=self.request.user,
            size_bytes=self.request.FILES.get("file").size if "file" in self.request.FILES else 0,
        )
        # Real deployment: this becomes an async job (Celery/RQ) that also
        # runs the file through ClamAV before it's eligible to publish.
        instance.compute_checksum()
        instance.scan_status = "clean"  # TODO(phase 2): real AV result
        instance.save(update_fields=["checksum_sha256", "scan_status"])
        log_action(self.request, "upload", instance)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        file = self.get_object()
        file.status = "published"
        file.published_at = timezone.now()
        file.save(update_fields=["status", "published_at"])
        log_action(request, "publish", file)
        return Response(FileAssetSerializer(file, context={"request": request}).data)

    def perform_destroy(self, instance):
        # Log while the object (and its pk) still exists -- an
        # AuditLog row is the only record that a file ever existed here.
        log_action(self.request, "delete", instance)
        instance.delete()

    @action(detail=True, methods=["post"])
    def mark_downloaded(self, request, pk=None):
        file = self.get_object()
        progress, _ = FileProgress.objects.get_or_create(user=request.user, file=file)
        progress.downloaded_at = timezone.now()
        progress.save(update_fields=["downloaded_at"])
        return Response({"status": "recorded"})
