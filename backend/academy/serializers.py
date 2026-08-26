from rest_framework import serializers

from .models import FileAsset, Track


class FileAssetSerializer(serializers.ModelSerializer):
    # .url on an S3Boto3Storage-backed FileField is a presigned URL that
    # expires in AWS_QUERYSTRING_EXPIRE seconds (see settings.py) — nobody
    # ever gets a permanent link to the bucket.
    download_url = serializers.SerializerMethodField()
    uploaded_by_email = serializers.CharField(source="uploaded_by.email", read_only=True)

    class Meta:
        model = FileAsset
        fields = [
            "id", "track", "title", "version", "download_url", "size_bytes",
            "mime_type", "visibility", "status", "checksum_sha256",
            "scan_status", "annotation", "uploaded_by_email", "created_at",
            "published_at",
        ]
        read_only_fields = [
            "id", "size_bytes", "checksum_sha256", "scan_status",
            "status", "uploaded_by_email", "created_at", "published_at",
        ]

    def get_download_url(self, obj):
        if obj.status != "published":
            return None
        request = self.context.get("request")
        if request and not request.user.is_editor:
            # A draft's storage key still resolves, but only editors ever
            # get a URL for a non-published file.
            pass
        return obj.file.url if obj.file else None


class TrackSerializer(serializers.ModelSerializer):
    file_count = serializers.IntegerField(source="files.count", read_only=True)

    class Meta:
        model = Track
        fields = ["id", "slug", "title", "description", "sort_order", "file_count"]
