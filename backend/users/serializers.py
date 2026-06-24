from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import MechanicProfile

User = get_user_model()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Les mots de passe ne correspondent pas."})

        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise serializers.ValidationError({"uid": "Lien de réinitialisation invalide."}) from exc

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": "Le lien de réinitialisation est invalide ou expiré."})

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "phone",
            "date_joined",
            "created_at",
        ]
        read_only_fields = ["id", "date_joined", "created_at", "role"]


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "phone",
            "is_active",
            "date_joined",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "date_joined", "created_at", "updated_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
            "phone",
        ]

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Le rôle Administrateur ne peut pas être choisi à l'inscription.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class NearbySearchSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    radius = serializers.FloatField(min_value=0.1, max_value=500, required=False, default=50)
    only_verified = serializers.BooleanField(required=False, default=False)


class MechanicProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = MechanicProfile
        fields = [
            "id",
            "user",
            "user_id",
            "full_name",
            "business_name",
            "bio",
            "specialties",
            "address",
            "city",
            "postal_code",
            "latitude",
            "longitude",
            "hourly_rate",
            "years_experience",
            "is_verified",
            "is_available",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "user_id",
            "full_name",
            "is_verified",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class MechanicProfileNearbySerializer(MechanicProfileSerializer):
    distance_km = serializers.SerializerMethodField()

    class Meta(MechanicProfileSerializer.Meta):
        fields = MechanicProfileSerializer.Meta.fields + ["distance_km"]

    def get_distance_km(self, obj):
        return round(obj.distance, 2)


class MechanicProfileCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MechanicProfile
        fields = [
            "business_name",
            "bio",
            "specialties",
            "address",
            "city",
            "postal_code",
            "latitude",
            "longitude",
            "hourly_rate",
            "years_experience",
            "is_available",
        ]

    def validate(self, attrs):
        user = self.context["request"].user
        if user.role != User.Role.MECANICIEN:
            raise serializers.ValidationError("Seul un mécanicien peut gérer un profil mécanicien.")

        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))

        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError("La latitude et la longitude doivent être renseignées ensemble.")

        return attrs