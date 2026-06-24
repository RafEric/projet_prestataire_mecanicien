from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import MechanicProfile, User


class MechanicProfileInline(admin.StackedInline):
    model = MechanicProfile
    can_delete = False
    fk_name = "user"
    extra = 0


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-created_at",)

    fieldsets = UserAdmin.fieldsets + (
        ("Informations supplémentaires", {"fields": ("role", "phone")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Informations supplémentaires", {"fields": ("role", "phone")}),
    )

    def get_inlines(self, request, obj=None):
        if obj and obj.role == User.Role.MECANICIEN:
            return [MechanicProfileInline]
        return []


@admin.register(MechanicProfile)
class MechanicProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "business_name",
        "city",
        "latitude",
        "longitude",
        "is_verified",
        "is_available",
        "average_rating",
        "total_reviews",
    )
    list_filter = ("is_verified", "is_available", "city")
    search_fields = ("user__email", "business_name", "specialties", "city")
    readonly_fields = ("average_rating", "total_reviews", "created_at", "updated_at")