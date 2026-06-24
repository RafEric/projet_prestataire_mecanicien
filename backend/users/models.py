from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = "client", "Client"
        MECANICIEN = "mecanicien", "Mécanicien"
        ADMIN = "admin", "Administrateur"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
    )
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    @property
    def is_mecanicien(self):
        return self.role == self.Role.MECANICIEN

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN


class MechanicProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="mechanic_profile",
        limit_choices_to={"role": User.Role.MECANICIEN},
    )
    business_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    specialties = models.CharField(
        max_length=255,
        blank=True,
        help_text="Spécialités séparées par des virgules (ex: freinage, moteur, climatisation)",
    )
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Latitude GPS (ex: 48.856613)",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Longitude GPS (ex: 2.352222)",
    )
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil mécanicien"
        verbose_name_plural = "Profils mécaniciens"
        ordering = ["-average_rating", "-created_at"]

    def __str__(self):
        return self.business_name or f"Profil de {self.user.get_full_name() or self.user.email}"

    def clean(self):
        if self.user_id and self.user.role != User.Role.MECANICIEN:
            raise ValidationError("Seul un utilisateur avec le rôle Mécanicien peut avoir un profil mécanicien.")

        if (self.latitude is None) ^ (self.longitude is None):
            raise ValidationError("La latitude et la longitude doivent être renseignées ensemble.")

        if self.latitude is not None and not -90 <= float(self.latitude) <= 90:
            raise ValidationError({"latitude": "La latitude doit être comprise entre -90 et 90."})

        if self.longitude is not None and not -180 <= float(self.longitude) <= 180:
            raise ValidationError({"longitude": "La longitude doit être comprise entre -180 et 180."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)