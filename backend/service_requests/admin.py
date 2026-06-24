from django.contrib import admin

from .models import Message, Review, ServiceRequest


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("sender", "content", "is_read", "created_at")
    can_delete = False


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "client",
        "mechanic",
        "status",
        "priority",
        "scheduled_at",
        "created_at",
    )
    list_filter = ("status", "priority", "created_at")
    search_fields = (
        "title",
        "description",
        "client__email",
        "mechanic__email",
        "license_plate",
    )
    readonly_fields = ("created_at", "updated_at", "completed_at")
    inlines = [MessageInline]
    raw_id_fields = ("client", "mechanic")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("service_request", "sender", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("content", "sender__email", "service_request__title")
    readonly_fields = ("created_at",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("service_request", "client", "mechanic", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("comment", "client__email", "mechanic__email")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("service_request", "client", "mechanic")