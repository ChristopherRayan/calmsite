"""Django app configuration for Calm Table API."""
import os

from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


class ApiConfig(AppConfig):
    """Application config for API app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "api"
    verbose_name = "Pages"

    def ready(self):
        # Import signal handlers during app startup.
        from . import signals  # noqa: F401

        # Optionally bootstrap a superuser in managed environments (e.g., Render).
        create_enabled = os.getenv("CREATE_SUPERUSER", "").lower() in {"1", "true", "yes", "y"}
        reset_enabled = os.getenv("RESET_SUPERUSER_PASSWORD", "").lower() in {"1", "true", "yes", "y"}

        if not create_enabled and not reset_enabled:
            return

        username = os.getenv("DJANGO_SUPERUSER_USERNAME", "").strip()
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip() or username
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "").strip()

        if not username or not password:
            return

        try:
            User = get_user_model()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email or username,
                    "is_staff": True,
                    "is_superuser": True,
                },
            )
            if created or reset_enabled:
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                if email:
                    user.email = email
                user.save()
        except (OperationalError, ProgrammingError):
            # Database isn't ready yet (migrations not applied).
            return
