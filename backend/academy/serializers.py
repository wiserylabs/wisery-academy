from rest_framework import serializers

from .models import FileAsset, FileProgress, Track


class FileAssetSerializer(serializers.ModelSerializer):
    # .url on an S3Boto3Storage-backed FileField is a presigned URL that
    # expires in AWS_QUERYSTRING_EXPIRE seconds (see settings.py) — nobody
    # ever gets a permanent link to the bucket.
    download_url = serializers.SerializerMethodField()
    uploaded_by_email = serializers.CharField(source="uploaded_by.email", read_only=True)
    # Whether the CURRENT user has downloaded this file before -- backs the
    # small "already downloaded" indicator in the file table. Always False
    # for an anonymous/missing request context (e.g. serialized outside a view).
    downloaded = serializers.SerializerMethodField()

    class Meta:
        model = FileAsset
        # "file" is the multipart upload field, write-only — clients never
        # get a raw storage path back, only the presigned "download_url".
        fields = [
            "id", "track", "title", "version", "file", "download_url",
            "size_bytes", "mime_type", "visibility", "status",
            "checksum_sha256", "scan_status", "annotation",
            "uploaded_by_email", "downloaded", "created_at", "published_at",
        ]
        read_only_fields = [
            "id", "size_bytes", "checksum_sha256", "scan_status",
            "status", "uploaded_by_email", "downloaded", "created_at", "published_at",
        ]
        extra_kwargs = {"file": {"write_only": True}}

    def get_download_url(self, obj):
        if obj.status != "published":
            return None
        request = self.context.get("request")
        if request and not request.user.is_editor:
            # A draft's storage key still resolves, but only editors ever
            # get a URL for a non-published file.
            pass
        return obj.file.url if obj.file else None

    def get_downloaded(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return FileProgress.objects.filter(
            user=request.user, file=obj, downloaded_at__isnull=False
        ).exists()


class TrackSerializer(serializers.ModelSerializer):
    file_count = serializers.IntegerField(source="files.count", read_only=True)
    # Real numbers behind the portal's "N of M downloaded" progress —
    # sourced from FileProgress, not a fake per-track counter. Both scoped
    # to published files only, since a draft was never downloadable.
    published_count = serializers.SerializerMethodField()
    downloaded_count = serializers.SerializerMethodField()
    # Most-recent publish in the track — backs the "Updated <date>" line on
    # each home card. Null for a track with nothing published yet.
    updated_at = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            "id", "slug", "title", "description", "sort_order",
            "file_count", "published_count", "downloaded_count", "updated_at",
        ]

    def get_updated_at(self, obj):
        latest = (
            obj.files.filter(status="published", published_at__isnull=False)
            .order_by("-published_at")
            .values_list("published_at", flat=True)
            .first()
        )
        return latest.isoformat() if latest else None

    def get_published_count(self, obj):
        return obj.files.filter(status="published").count()

    def get_downloaded_count(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        return FileProgress.objects.filter(
            user=request.user,
            file__track=obj,
            file__status="published",
            downloaded_at__isnull=False,
        ).count()
