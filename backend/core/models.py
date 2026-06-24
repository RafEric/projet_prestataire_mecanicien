from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        REQUEST_ASSIGNED = "request_assigned", "Demande assignée"
        REQUEST_STATUS = "request_status", "Changement de statut"
        NEW_MESSAGE = "new_message", "Nouveau message"
        NEW_REVIEW = "new_review", "Nouvel avis"
        PROFILE_VERIFIED = "profile_verified", "Profil vérifié"
        GENERAL = "general", "Général"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
        default=Type.GENERAL,
    )
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read", "created_at"]),
        ]

    def __str__(self):
        return f"{self.title} — {self.user.email}"