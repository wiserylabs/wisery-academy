from django.contrib import admin

from .models import AuditLog, FileAsset, FileProgress, Track


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "sort_order"]
    prepopulated_fields = {"slug": ("title",)}


@admin.register(FileAsset)
class FileAssetAdmin(admin.ModelAdmin):
    list_display = ["title", "track", "version", "status", "visibility", "scan_status", "uploaded_by", "created_at"]
    list_filter = ["status", "visibility", "scan_status", "track"]
    search_fields = ["title"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "user", "action", "target_type", "target_id"]
    list_filter = ["action", "target_type"]
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


admin.site.register(FileProgress)
