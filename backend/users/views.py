from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdminRole, IsClient, IsMechanic, IsMechanicProfileOwnerOrAdmin
from core.services import notify_user
from core.models import Notification

from .geo import get_mechanics_by_distance
from .models import MechanicProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    MechanicProfileCreateUpdateSerializer,
    MechanicProfileNearbySerializer,
    MechanicProfileSerializer,
    NearbySearchSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserAdminSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Inscription réussie.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"message": "Si un compte existe, un email de réinitialisation a été envoyé."},
                status=status.HTTP_200_OK,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Réinitialisation de votre mot de passe",
            message=(
                f"Bonjour {user.first_name},\n\n"
                f"Cliquez sur le lien suivant pour réinitialiser votre mot de passe :\n{reset_url}\n\n"
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        response_data = {"message": "Si un compte existe, un email de réinitialisation a été envoyé."}
        if settings.DEBUG:
            response_data["reset_url"] = reset_url

        return Response(response_data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Mot de passe réinitialisé avec succès."}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminRole]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering_fields = ["created_at", "email", "last_name"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return UserAdminSerializer
        return UserAdminSerializer


class MechanicProfileViewSet(viewsets.ModelViewSet):
    queryset = MechanicProfile.objects.select_related("user").all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["city", "is_verified", "is_available"]
    search_fields = ["business_name", "specialties", "city", "user__email", "user__first_name"]
    ordering_fields = ["average_rating", "hourly_rate", "created_at", "years_experience"]
    ordering = ["-average_rating"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsMechanic()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsMechanicProfileOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return MechanicProfileCreateUpdateSerializer
        return MechanicProfileSerializer

    def perform_create(self, serializer):
        if MechanicProfile.objects.filter(user=self.request.user).exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError({"detail": "Vous avez déjà un profil mécanicien."})
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        old_verified = serializer.instance.is_verified
        profile = serializer.save()
        if not old_verified and profile.is_verified:
            notify_user(
                profile.user,
                title="Profil vérifié",
                message="Votre profil mécanicien a été validé par un administrateur.",
                notification_type=Notification.Type.PROFILE_VERIFIED,
                link="/mechanic/profile",
            )

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsMechanic])
    def me(self, request):
        try:
            profile = request.user.mechanic_profile
        except MechanicProfile.DoesNotExist:
            return Response({"detail": "Profil mécanicien introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MechanicProfileSerializer(profile).data)

    @action(detail=False, methods=["get"], url_path="nearby", permission_classes=[permissions.IsAuthenticated, IsClient])
    def nearby(self, request):
        params = NearbySearchSerializer(data=request.query_params)
        params.is_valid(raise_exception=True)

        queryset = get_mechanics_by_distance(
            latitude=params.validated_data["latitude"],
            longitude=params.validated_data["longitude"],
            radius_km=params.validated_data["radius"],
            only_verified=params.validated_data["only_verified"],
        )

        page = self.paginate_queryset(queryset)
        profiles = page if page is not None else queryset
        serializer = MechanicProfileNearbySerializer(profiles, many=True)

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(
            {
                "count": len(serializer.data),
                "latitude": params.validated_data["latitude"],
                "longitude": params.validated_data["longitude"],
                "radius_km": params.validated_data["radius"],
                "results": serializer.data,
            }
        )