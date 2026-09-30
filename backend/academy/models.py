import hashlib
import uuid

from django.conf import settings
from django.db import models


class Track(models.Model):
    """One of the material folders — Slide Decks, Lab Guides, the
    Technical Section, etc. The Technical Section isn't a special case:
    it's just a track whose files default to Visibility.TECHNICAL_PLUS."""

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self):
        return self.title


class Visibility(models.TextChoices):
    ALL = "all", "All roles"
    TECHNICAL_PLUS = "technical_plus", "Technical +"
    EDITORS_ONLY = "editors_only", "Editors only"


class FileStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"


class ScanStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    CLEAN = "clean", "Clean"
    INFECTED = "infected", "Infected"


def file_upload_path(instance, filename):
    # {bucket}/{track-slug}/{file-id}/{version}/{filename} — the exact
    # convention from the architecture plan. instance.id is a uuid4
    # assigned at instantiation, so it's already set before first save.
    return f"{instance.track.slug}/{instance.id}/{instance.version}/{filename}"


class FileAsset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    track = models.ForeignKey(Track, related_name="files", on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    version = models.CharField(max_length=20, default="1.0")
    file = models.FileField(upload_to=file_upload_path, max_length=500)
    size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=150, blank=True)

    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.ALL)
    status = models.CharField(max_length=20, choices=FileStatus.choices, default=FileStatus.DRAFT)

    # Editors flag required reading. A reader's progress ("X of Y") counts
    # only must-read files: Y is how many they must read, X is how many of
    # those they've downloaded.
    must_read = models.BooleanField(default=False)

    checksum_sha256 = models.CharField(max_length=64, blank=True)
    # TODO(phase 2): a background worker flips this via a ClamAV scan
    # before a file is allowed to leave draft — wired up as a stub here.
    scan_status = models.CharField(max_length=20, choices=ScanStatus.choices, default=ScanStatus.PENDING)

    annotation = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="uploaded_files",
        null=True, on_delete=models.SET_NULL,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} v{self.version} ({self.status})"

    def save(self, *args, **kwargs):
        # The Technical Section is defined by access, not by folder name: a
        # file in it is never world-visible. Coerce an "all" upload up to
        # Technical+ so a Student can't see it even if the uploader left the
        # visibility on its default. (Editors can still choose editors_only.)
        if self.track_id and self.visibility == Visibility.ALL and self.track.slug == "technical-section":
            self.visibility = Visibility.TECHNICAL_PLUS
        super().save(*args, **kwargs)

    def compute_checksum(self):
        """Streams the stored file through SHA-256 without loading it
        entirely into memory — fine for the multi-GB decks/videos this
        portal handles."""
        digest = hashlib.sha256()
        self.file.open("rb")
        try:
            for chunk in self.file.chunks():
                digest.update(chunk)
        finally:
            self.file.close()
        self.checksum_sha256 = digest.hexdigest()
        return self.checksum_sha256


class FileProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="file_progress", on_delete=models.CASCADE)
    file = models.ForeignKey(FileAsset, related_name="progress", on_delete=models.CASCADE)
    first_opened_at = models.DateTimeField(null=True, blank=True)
    downloaded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "file")


class AuditLog(models.Model):
    """Immutable — every editor action, matching the "Logged as {editor}"
    line already in the upload modal design."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=50)
    target_type = models.CharField(max_length=50)
    target_id = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} on {self.target_type}:{self.target_id} by {self.user_id}"


class SiteSettings(models.Model):
    """Single row of portal-wide settings editors control. Right now that's the
    certification-exam window and which material library the exam link opens."""

    exam_opens_at = models.DateField(null=True, blank=True)
    exam_closes_at = models.DateField(null=True, blank=True)
    exam_track = models.ForeignKey(
        Track, null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )

    class Meta:
        verbose_name = "site settings"
        verbose_name_plural = "site settings"

    def __str__(self):
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce a singleton row
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
