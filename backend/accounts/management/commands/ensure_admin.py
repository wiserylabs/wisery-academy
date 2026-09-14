import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

TRUTHY = {"1", "true", "yes", "on"}


class Command(BaseCommand):
    """Ensure a bootstrap admin (Editor) account exists, driven by env vars.

    Wired into the api container's startup so a freshly deployed box is never
    locked out for want of a login. It is deliberately conservative and
    idempotent:

      * Does nothing (and never errors) when ADMIN_EMAIL / ADMIN_PASSWORD are
        unset -- so it's a no-op in environments that seed users another way.
      * Creates the account as an Editor (also staff + superuser, so the Django
        admin works) if it's missing.
      * If the account already exists, only ensures it's active and an Editor.
        It does NOT reset the password on every boot -- so an admin who changes
        their password in the app keeps it. Set ADMIN_FORCE_PASSWORD=1 to force
        a one-off reset back to ADMIN_PASSWORD (e.g. to recover access).
    """

    help = "Idempotently ensure a bootstrap admin (Editor) exists from ADMIN_EMAIL / ADMIN_PASSWORD."

    def handle(self, *args, **options):
        email = (os.environ.get("ADMIN_EMAIL") or "").strip()
        password = os.environ.get("ADMIN_PASSWORD") or ""
        name = (os.environ.get("ADMIN_NAME") or "Portal Admin").strip()
        force = (os.environ.get("ADMIN_FORCE_PASSWORD") or "").strip().lower() in TRUTHY

        if not email or not password:
            self.stdout.write("ensure_admin: ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping.")
            return

        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            user = User(
                email=email, full_name=name, role="editor",
                is_active=True, is_staff=True, is_superuser=True,
            )
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"ensure_admin: created admin editor {email}"))
            return

        changed = []
        if user.role != "editor":
            user.role = "editor"
            changed.append("role->editor")
        if not user.is_active:
            user.is_active = True
            changed.append("reactivated")
        if force:
            user.set_password(password)
            changed.append("password reset")

        if changed:
            user.save()
            self.stdout.write(self.style.SUCCESS(f"ensure_admin: updated {email} ({', '.join(changed)})"))
        else:
            self.stdout.write(f"ensure_admin: admin {email} already present - no change.")
