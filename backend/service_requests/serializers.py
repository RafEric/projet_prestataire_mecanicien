from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from users.serializers import UserSerializer

from core.models import Notification
from core.services import notify_user

from .models import Message, Review, ServiceRequest
from .utils import update_mechanic_rating_stats

User = get_user_model()


class ServiceRequestListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.get_full_name", read_only=True)
    mechanic_name = serializers.CharField(source="mechanic.get_full_name", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "title",
            "status",
            "priority",
            "client",
            "client_name",
            "mechanic",
            "mechanic_name",
            "city",
            "scheduled_at",
            "estimated_price",
            "created_at",
        ]


class ServiceRequestDetailSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    mechanic = UserSerializer(read_only=True)
    messages_count = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "client",
            "mechanic",
            "title",
            "description",
            "vehicle_brand",
            "vehicle_model",
            "vehicle_year",
            "license_plate",
            "status",
            "priority",
            "address",
            "city",
            "postal_code",
            "scheduled_at",
            "estimated_price",
            "final_price",
            "completed_at",
            "messages_count",
            "has_review",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "client",
            "mechanic",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def get_messages_count(self, obj):
        return obj.messages.count()

    def get_has_review(self, obj):
        return hasattr(obj, "review")


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = [
            "title",
            "description",
            "vehicle_brand",
            "vehicle_model",
            "vehicle_year",
            "license_plate",
            "priority",
            "address",
            "city",
            "postal_code",
            "scheduled_at",
            "estimated_price",
        ]

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)


class ServiceRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = [
            "title",
            "description",
            "vehicle_brand",
            "vehicle_model",
            "vehicle_year",
            "license_plate",
            "status",
            "priority",
            "address",
            "city",
            "postal_code",
            "scheduled_at",
            "estimated_price",
            "final_price",
            "mechanic",
        ]

    def validate_status(self, value):
        instance = self.instance
        if not instance:
            return value

        user = self.context["request"].user
        allowed_transitions = {
            ServiceRequest.Status.PENDING: {
                ServiceRequest.Status.ACCEPTED,
                ServiceRequest.Status.CANCELLED,
            },
            ServiceRequest.Status.ACCEPTED: {
                ServiceRequest.Status.IN_PROGRESS,
                ServiceRequest.Status.CANCELLED,
            },
            ServiceRequest.Status.IN_PROGRESS: {
                ServiceRequest.Status.COMPLETED,
                ServiceRequest.Status.CANCELLED,
            },
        }

        if user.role == "admin" or user.is_staff:
            return value

        if value != instance.status:
            valid_next = allowed_transitions.get(instance.status, set())
            if value not in valid_next:
                raise serializers.ValidationError(
                    f"Transition de statut invalide : {instance.status} → {value}."
                )
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        instance = self.instance

        if user.role == "client" and instance.client != user:
            raise serializers.ValidationError("Vous ne pouvez modifier que vos propres demandes.")

        if user.role == "mecanicien":
            if instance.mechanic != user:
                raise serializers.ValidationError("Vous n'êtes pas assigné à cette demande.")
            if "mechanic" in attrs:
                raise serializers.ValidationError({"mechanic": "Un mécanicien ne peut pas réassigner la demande."})

        if attrs.get("status") == ServiceRequest.Status.COMPLETED and not attrs.get("final_price"):
            if not instance.final_price:
                raise serializers.ValidationError(
                    {"final_price": "Le prix final est requis pour marquer une demande comme terminée."}
                )

        return attrs

    def update(self, instance, validated_data):
        if validated_data.get("status") == ServiceRequest.Status.COMPLETED:
            validated_data["completed_at"] = timezone.now()
        return super().update(instance, validated_data)


class ServiceRequestAssignSerializer(serializers.Serializer):
    mechanic_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        user = self.context["request"].user
        service_request = self.context["service_request"]

        if service_request.status != ServiceRequest.Status.PENDING:
            raise serializers.ValidationError("Seules les demandes en attente peuvent être assignées.")

        if user.role == "mecanicien":
            attrs["mechanic"] = user
        elif user.role in ("admin",) or user.is_staff:
            mechanic_id = attrs.get("mechanic_id")
            if not mechanic_id:
                raise serializers.ValidationError({"mechanic_id": "Ce champ est requis pour un administrateur."})
            try:
                attrs["mechanic"] = User.objects.get(id=mechanic_id, role=User.Role.MECANICIEN)
            except User.DoesNotExist as exc:
                raise serializers.ValidationError({"mechanic_id": "Mécanicien introuvable."}) from exc
        else:
            raise serializers.ValidationError("Vous n'êtes pas autorisé à assigner cette demande.")

        return attrs


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "service_request", "sender", "content", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "is_read", "created_at"]


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["content"]

    def create(self, validated_data):
        service_request = self.context["service_request"]
        validated_data["service_request"] = service_request
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    mechanic = UserSerializer(read_only=True)
    service_request_title = serializers.CharField(source="service_request.title", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "service_request",
            "service_request_title",
            "client",
            "mechanic",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client", "mechanic", "created_at", "updated_at"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["service_request", "rating", "comment"]

    def validate_service_request(self, value):
        user = self.context["request"].user
        if value.client != user:
            raise serializers.ValidationError("Vous ne pouvez noter que vos propres demandes.")
        if value.status != ServiceRequest.Status.COMPLETED:
            raise serializers.ValidationError("La demande doit être terminée avant de laisser un avis.")
        if not value.mechanic:
            raise serializers.ValidationError("Aucun mécanicien n'est assigné à cette demande.")
        if hasattr(value, "review"):
            raise serializers.ValidationError("Un avis existe déjà pour cette demande.")
        return value

    def create(self, validated_data):
        service_request = validated_data["service_request"]
        validated_data["client"] = self.context["request"].user
        validated_data["mechanic"] = service_request.mechanic
        review = super().create(validated_data)
        update_mechanic_rating_stats(service_request.mechanic)
        notify_user(
            service_request.mechanic,
            title="Nouvel avis reçu",
            message=f"Vous avez reçu un avis {review.rating}/5 pour « {service_request.title} ».",
            notification_type=Notification.Type.NEW_REVIEW,
            link="/mechanic/reviews",
        )
        return review