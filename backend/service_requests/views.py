from django.contrib.auth import get_user_model
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from core.models import Notification
from core.permissions import (
    IsAdminRole,
    IsClient,
    IsMessageParticipantOrAdmin,
    IsReviewAuthorOrAdmin,
    IsServiceRequestParticipantOrAdmin,
)
from core.services import notify_user

from .filters import MessageFilter, ReviewFilter, ServiceRequestFilter
from .models import Message, Review, ServiceRequest
from .realtime import push_chat_message, push_request_update
from .utils import update_mechanic_rating_stats
from .serializers import (
    MessageCreateSerializer,
    MessageSerializer,
    ReviewCreateSerializer,
    ReviewSerializer,
    ServiceRequestAssignSerializer,
    ServiceRequestCreateSerializer,
    ServiceRequestDetailSerializer,
    ServiceRequestListSerializer,
    ServiceRequestUpdateSerializer,
)

User = get_user_model()


class ServiceRequestViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ServiceRequestFilter
    search_fields = ["title", "description", "vehicle_brand", "license_plate", "city"]
    ordering_fields = ["created_at", "scheduled_at", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = ServiceRequest.objects.select_related("client", "mechanic").all()

        if not user.is_authenticated:
            return queryset.none()

        if user.role == "admin" or user.is_staff:
            return queryset

        if user.role == "client":
            return queryset.filter(client=user)

        if user.role == "mecanicien":
            return queryset.filter(Q(mechanic=user) | Q(status=ServiceRequest.Status.PENDING, mechanic__isnull=True))

        return queryset.none()

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsClient()]
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        if self.action == "assign":
            return [permissions.IsAuthenticated()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsServiceRequestParticipantOrAdmin()]
        if self.action in ("messages", "send_message"):
            return [permissions.IsAuthenticated(), IsServiceRequestParticipantOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "list":
            return ServiceRequestListSerializer
        if self.action == "create":
            return ServiceRequestCreateSerializer
        if self.action in ("update", "partial_update"):
            return ServiceRequestUpdateSerializer
        if self.action == "assign":
            return ServiceRequestAssignSerializer
        if self.action == "send_message":
            return MessageCreateSerializer
        return ServiceRequestDetailSerializer

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role not in ("admin",) and not user.is_staff:
            if user.role == "client" and instance.status != ServiceRequest.Status.PENDING:
                from rest_framework.exceptions import ValidationError

                raise ValidationError("Seules les demandes en attente peuvent être supprimées.")
            if user.role == "mecanicien":
                from rest_framework.exceptions import ValidationError

                raise ValidationError("Un mécanicien ne peut pas supprimer une demande.")
        instance.delete()

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        service_request = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "service_request": service_request},
        )
        serializer.is_valid(raise_exception=True)
        service_request.mechanic = serializer.validated_data["mechanic"]
        service_request.status = ServiceRequest.Status.ACCEPTED
        service_request.save()
        service_request = ServiceRequest.objects.select_related("client", "mechanic").get(pk=service_request.pk)
        push_request_update(service_request)

        notify_user(
            service_request.client,
            title="Demande acceptée",
            message=f"Votre demande « {service_request.title} » a été acceptée par un mécanicien.",
            notification_type=Notification.Type.REQUEST_ASSIGNED,
            link=f"/client/requests/{service_request.id}",
        )
        notify_user(
            service_request.mechanic,
            title="Nouvelle intervention",
            message=f"Vous avez accepté la demande « {service_request.title} ».",
            notification_type=Notification.Type.REQUEST_ASSIGNED,
            link=f"/mechanic/requests/{service_request.id}",
        )

        return Response(ServiceRequestDetailSerializer(service_request).data)

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        service_request = self.get_object()
        messages = service_request.messages.select_related("sender").all()
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(MessageSerializer(messages, many=True).data)

    @action(detail=True, methods=["post"], url_path="messages/send")
    def send_message(self, request, pk=None):
        service_request = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "service_request": service_request},
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        push_chat_message(message)
        self._notify_new_message(service_request, message.sender)
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    def _notify_new_message(self, service_request, sender):
        recipients = [u for u in (service_request.client, service_request.mechanic) if u and u != sender]
        for recipient in recipients:
            link = (
                f"/client/chat?request={service_request.id}"
                if recipient.role == "client"
                else f"/mechanic/requests/{service_request.id}"
            )
            notify_user(
                recipient,
                title="Nouveau message",
                message=f"Nouveau message sur « {service_request.title} ».",
                notification_type=Notification.Type.NEW_MESSAGE,
                link=link,
            )

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        instance = serializer.save()
        instance = ServiceRequest.objects.select_related("client", "mechanic").get(pk=instance.pk)
        push_request_update(instance)
        if old_status != instance.status:
            status_label = instance.get_status_display()
            for user in (instance.client, instance.mechanic):
                if not user:
                    continue
                link = (
                    f"/client/requests/{instance.id}"
                    if user.role == "client"
                    else f"/mechanic/requests/{instance.id}"
                )
                notify_user(
                    user,
                    title="Statut mis à jour",
                    message=f"La demande « {instance.title} » est maintenant : {status_label}.",
                    notification_type=Notification.Type.REQUEST_STATUS,
                    link=link,
                )


class MessageViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = MessageFilter
    ordering_fields = ["created_at"]
    ordering = ["created_at"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.select_related("sender", "service_request").all()

        if not user.is_authenticated:
            return queryset.none()

        if user.role == "admin" or user.is_staff:
            return queryset

        return queryset.filter(
            Q(service_request__client=user) | Q(service_request__mechanic=user)
        )

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in ("retrieve", "list"):
            return [permissions.IsAuthenticated()]
        if self.action in ("partial_update", "update"):
            return [permissions.IsAuthenticated(), IsMessageParticipantOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return MessageCreateSerializer
        return MessageSerializer

    def create(self, request, *args, **kwargs):
        service_request_id = request.data.get("service_request")
        if not service_request_id:
            return Response(
                {"service_request": "Ce champ est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service_request = ServiceRequest.objects.get(pk=service_request_id)
        except ServiceRequest.DoesNotExist:
            return Response(
                {"service_request": "Demande introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        if user.role not in ("admin",) and not user.is_staff:
            if user not in (service_request.client, service_request.mechanic):
                return Response(
                    {"detail": "Vous n'êtes pas participant à cette demande."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "service_request": service_request},
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        push_chat_message(message)
        self._notify_new_message(service_request, request.user)
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    def _notify_new_message(self, service_request, sender):
        recipients = [u for u in (service_request.client, service_request.mechanic) if u and u != sender]
        for recipient in recipients:
            link = (
                f"/client/chat?request={service_request.id}"
                if recipient.role == "client"
                else f"/mechanic/requests/{service_request.id}"
            )
            notify_user(
                recipient,
                title="Nouveau message",
                message=f"Nouveau message sur « {service_request.title} ».",
                notification_type=Notification.Type.NEW_MESSAGE,
                link=link,
            )

    def partial_update(self, request, *args, **kwargs):
        message = self.get_object()
        if "is_read" in request.data:
            message.is_read = request.data["is_read"]
            message.save(update_fields=["is_read"])
            return Response(MessageSerializer(message).data)
        return Response(
            {"detail": "Seul le champ is_read peut être modifié."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class ReviewViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ReviewFilter
    search_fields = ["comment", "mechanic__email", "client__email"]
    ordering_fields = ["created_at", "rating"]
    ordering = ["-created_at"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Review.objects.select_related("client", "mechanic", "service_request").all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsClient()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsReviewAuthorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_update(self, serializer):
        review = serializer.save()
        update_mechanic_rating_stats(review.mechanic)

    def perform_destroy(self, instance):
        mechanic = instance.mechanic
        instance.delete()
        update_mechanic_rating_stats(mechanic)