import hashlib

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import AuditLog, FileAsset, Track


@pytest.fixture
def track(db):
    return Track.objects.create(slug="slide-decks", title="Slide Decks", sort_order=1)


@pytest.fixture
def technical_track(db):
    return Track.objects.create(slug="technical-section", title="Technical Section", sort_order=7)


def make_upload(name="day1.pptx", content=b"fake-pptx-bytes"):
    return SimpleUploadedFile(name, content, content_type="application/octet-stream")


@pytest.mark.django_db
class TestFileAssetModel:
    def test_storage_key_follows_track_id_version_convention(self, track):
        fa = FileAsset(track=track, title="Day 1 deck", version="2.4.1")
        fa.file.save("day1.pptx", make_upload(), save=False)
        assert fa.file.name == f"{track.slug}/{fa.id}/2.4.1/day1.pptx"

    def test_new_file_defaults_to_draft_and_pending_scan(self, track):
        fa = FileAsset.objects.create(track=track, title="Day 1 deck")
        assert fa.status == "draft"
        assert fa.scan_status == "pending"
        assert fa.published_at is None

    def test_compute_checksum_matches_sha256_of_the_bytes(self, track):
        content = b"fake-pptx-bytes"
        fa = FileAsset(track=track, title="Day 1 deck")
        fa.file.save("day1.pptx", make_upload(content=content), save=False)
        fa.save()

        checksum = fa.compute_checksum()

        assert checksum == hashlib.sha256(content).hexdigest()
        assert fa.checksum_sha256 == checksum


@pytest.mark.django_db
class TestFileUploadAndPublishAPI:
    def test_editor_can_upload_a_file_as_draft(self, as_user, editor, track):
        client = as_user(editor)
        resp = client.post(
            "/api/files/",
            {"track": track.id, "title": "Day 1 deck", "version": "2.4.1", "file": make_upload()},
            format="multipart",
        )
        assert resp.status_code == 201, resp.data
        assert resp.data["status"] == "draft"
        assert len(resp.data["checksum_sha256"]) == 64  # computed synchronously on upload
        assert resp.data["download_url"] is None  # not published yet

    def test_student_cannot_upload_a_file(self, as_user, student, track):
        client = as_user(student)
        resp = client.post(
            "/api/files/",
            {"track": track.id, "title": "Day 1 deck", "file": make_upload()},
            format="multipart",
        )
        assert resp.status_code == 403

    def test_publish_sets_status_and_writes_an_audit_log_entry(self, as_user, editor, track):
        client = as_user(editor)
        upload = client.post(
            "/api/files/",
            {"track": track.id, "title": "Day 1 deck", "file": make_upload()},
            format="multipart",
        )
        file_id = upload.data["id"]

        resp = client.post(f"/api/files/{file_id}/publish/")

        assert resp.status_code == 200
        assert resp.data["status"] == "published"
        assert resp.data["published_at"] is not None
        assert resp.data["download_url"] is not None

        # perform_create() already logged "upload"; publish adds a second,
        # distinct row -- this is correct, so filter to the one we're
        # checking rather than assuming there's only one.
        entry = AuditLog.objects.get(target_id=file_id, action="publish")
        assert entry.action == "publish"
        assert entry.user.email == editor.email

    def test_student_cannot_publish_a_file(self, as_user, editor, student, track):
        upload = as_user(editor).post(
            "/api/files/",
            {"track": track.id, "title": "Day 1 deck", "file": make_upload()},
            format="multipart",
        )
        file_id = upload.data["id"]

        resp = as_user(student).post(f"/api/files/{file_id}/publish/")
        assert resp.status_code == 403


@pytest.mark.django_db
class TestRoleBasedVisibility:
    """The part the whole portal hinges on: Student sees the general
    material, Technical also sees the Technical Section, Editor sees
    everything including drafts."""

    @pytest.fixture(autouse=True)
    def _files(self, track, technical_track, editor):
        self.public_file = FileAsset.objects.create(
            track=track, title="Day 1 deck", status="published", visibility="all", uploaded_by=editor,
        )
        self.technical_file = FileAsset.objects.create(
            track=technical_track, title="Runbook", status="published", visibility="technical_plus", uploaded_by=editor,
        )
        self.editors_only_file = FileAsset.objects.create(
            track=technical_track, title="Draft process notes", status="published", visibility="editors_only", uploaded_by=editor,
        )
        self.draft_file = FileAsset.objects.create(
            track=track, title="Unfinished deck", status="draft", visibility="all", uploaded_by=editor,
        )

    def test_student_sees_only_all_visibility_published_files(self, as_user, student):
        resp = as_user(student).get("/api/files/")
        titles = {f["title"] for f in resp.data["results"]}
        assert titles == {"Day 1 deck"}

    def test_technical_sees_technical_plus_but_not_editors_only(self, as_user, technical):
        resp = as_user(technical).get("/api/files/")
        titles = {f["title"] for f in resp.data["results"]}
        assert titles == {"Day 1 deck", "Runbook"}

    def test_editor_sees_everything_including_drafts(self, as_user, editor):
        resp = as_user(editor).get("/api/files/")
        titles = {f["title"] for f in resp.data["results"]}
        assert titles == {"Day 1 deck", "Runbook", "Draft process notes", "Unfinished deck"}

    def test_draft_file_is_invisible_to_non_editors_regardless_of_visibility(self, as_user, technical):
        resp = as_user(technical).get("/api/files/")
        titles = {f["title"] for f in resp.data["results"]}
        assert "Unfinished deck" not in titles

    def test_student_cannot_fetch_a_technical_file_directly_by_id(self, as_user, student):
        resp = as_user(student).get(f"/api/files/{self.technical_file.id}/")
        assert resp.status_code == 404  # filtered out of the queryset entirely, not a 403 leak


@pytest.mark.django_db
@pytest.mark.django_db
class TestMarkDownloaded:
    """A student recording their own progress is not the same thing as
    editing the file — this must stay allowed for anyone who can already
    see the file, even though it's a POST. (Regression test: CanViewFile
    used to blanket-deny every non-GET method to non-editors, which broke
    this for every Student and Technical user.)"""

    def test_student_can_mark_a_visible_file_as_downloaded(self, as_user, student, track):
        f = FileAsset.objects.create(track=track, title="Day 1 deck", status="published", visibility="all")
        resp = as_user(student).post(f"/api/files/{f.id}/mark_downloaded/")
        assert resp.status_code == 200
        f.refresh_from_db()
        assert f.progress.get(user=student).downloaded_at is not None

    def test_student_cannot_mark_a_hidden_technical_file_as_downloaded(self, as_user, student, technical_track):
        f = FileAsset.objects.create(
            track=technical_track, title="Runbook", status="published", visibility="technical_plus"
        )
        resp = as_user(student).post(f"/api/files/{f.id}/mark_downloaded/")
        assert resp.status_code == 404  # excluded from the queryset entirely


class TestTrackAPI:
    def test_tracks_require_authentication(self, api_client):
        resp = api_client.get("/api/tracks/")
        assert resp.status_code == 401

    def test_authenticated_user_can_list_tracks(self, as_user, student, track):
        resp = as_user(student).get("/api/tracks/")
        assert resp.status_code == 200
        assert any(t["slug"] == "slide-decks" for t in resp.data["results"])
