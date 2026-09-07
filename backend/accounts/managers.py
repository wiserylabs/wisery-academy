from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """Users sign in with email, not a username."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        # Every public sign-up is a Student — full stop. This is the only
        # path the HTTP API (SignupSerializer) ever calls, but it's
        # enforced here too, unconditionally, so a caller can't escalate
        # a role by passing role=... directly to the manager. Promoting
        # someone to Technical or Editor is a separate, explicit action
        # (the Django admin today; an in-app "manage users" screen later)
        # — never something bundled into account creation.
        extra_fields["role"] = "student"
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields["role"] = "editor"
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        return self._create_user(email, password, **extra_fields)
