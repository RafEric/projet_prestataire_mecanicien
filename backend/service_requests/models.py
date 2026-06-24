from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class ServiceRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        ACCEPTED = "accepted", "Acceptée"
        IN_PROGRESS = "in_progress", "En cours"
        COMPLETED = "completed", "Terminée"
        CANCELLED = "cancelled", "Annulée"

    class Priority(models.TextChoices):
        LOW = "low", "Basse"
        MEDIUM = "medium", "Moyenne"
        HIGH = "high", "Haute"
        URGENT = "urgent", "Urgente"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_requests_as_client",
        limit_choices_to={"role": "client"},
    )
    mechanic = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="service_requests_as_mechanic",
        limit_choices_to={"role": "mecanicien"},
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    vehicle_brand = models.CharField(max_length=100, blank=True)
    vehicle_model = models.CharField(max_length=100, blank=True)
    vehicle_year = models.PositiveIntegerField(null=True, blank=True)
    license_plate = models.CharField(max_length=20, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Demande de service"
        verbose_name_plural = "Demandes de service"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["client", "status"]),
            models.Index(fields=["mechanic", "status"]),
        ]

    def __str__(self):
        return f"{self.title} — {self.get_status_display()}"

    def clean(self):
        if self.client_id and self.client.role != "client":
            raise ValidationError({"client": "Le client doit avoir le rôle Client."})
        if self.mechanic_id and self.mechanic.role != "mecanicien":
            raise ValidationError({"mechanic": "Le mécanicien doit avoir le rôle Mécanicien."})
        if self.client_id and self.mechanic_id and self.client_id == self.mechanic_id:
            raise ValidationError("Le client et le mécanicien ne peuvent pas être la même personne.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Message(models.Model):
    service_request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["service_request", "created_at"]),
            models.Index(fields=["sender", "is_read"]),
        ]

    def __str__(self):
        return f"Message de {self.sender.email} — {self.created_at:%d/%m/%Y %H:%M}"

    def clean(self):
        if not self.service_request_id or not self.sender_id:
            return

        participants = {self.service_request.client_id}
        if self.service_request.mechanic_id:
            participants.add(self.service_request.mechanic_id)

        if self.sender_id not in participants:
            raise ValidationError("Seuls le client et le mécanicien assigné peuvent envoyer des messages.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Review(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="review",
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given",
        limit_choices_to={"role": "client"},
    )
    mechanic = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
        limit_choices_to={"role": "mecanicien"},
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Avis"
        verbose_name_plural = "Avis"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["mechanic", "rating"]),
            models.Index(fields=["client", "created_at"]),
        ]

    def __str__(self):
        return f"Avis {self.rating}/5 — {self.mechanic.email}"

    def clean(self):
        if not self.service_request_id:
            return

        if self.service_request.status != ServiceRequest.Status.COMPLETED:
            raise ValidationError("Un avis ne peut être laissé que sur une demande terminée.")

        if self.client_id and self.service_request.client_id != self.client_id:
            raise ValidationError("Seul le client de la demande peut laisser un avis.")

        if self.mechanic_id and self.service_request.mechanic_id != self.mechanic_id:
            raise ValidationError("L'avis doit concerner le mécanicien assigné à la demande.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)