from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsEditor(BasePermission):
    """Only Editors can create, publish, or delete files."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_editor)


class CanViewFile(BasePermission):
    """Mirrors the visibility rule from the upload modal: All roles /
    Technical+ / Editors only — and drafts are only visible to editors."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method not in SAFE_METHODS:
            return user.is_editor

        if obj.status == "draft" and not user.is_editor:
            return False
        if obj.visibility == "editors_only":
            return user.is_editor
        if obj.visibility == "technical_plus":
            return user.is_technical_or_above
        return True
