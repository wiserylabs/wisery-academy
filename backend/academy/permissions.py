from rest_framework.permissions import BasePermission


class IsEditor(BasePermission):
    """Only Editors can create, update, delete, or publish files."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_editor)


class CanViewFile(BasePermission):
    """Whether this user may see — or act on their own progress for
    (mark_downloaded) — this particular file. The same draft/visibility
    rule applies regardless of HTTP method: a Student's own download-marker
    POST is not a mutation of the file, so it isn't editor-gated the way
    create/update/destroy/publish are (those are gated separately, in
    FileAssetViewSet.get_permissions())."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_editor:
            return True
        if obj.status == "draft":
            return False
        if obj.visibility == "editors_only":
            return False
        if obj.visibility == "technical_plus":
            return user.is_technical_or_above
        return True
