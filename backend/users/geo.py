from django.db.models import ExpressionWrapper, F, FloatField, QuerySet, Value
from django.db.models.functions import ACos, Cos, Radians, Sin

from .models import MechanicProfile

EARTH_RADIUS_KM = 6371.0


def get_mechanics_by_distance(
    latitude: float,
    longitude: float,
    radius_km: float | None = None,
    *,
    only_available: bool = True,
    only_verified: bool = False,
) -> QuerySet[MechanicProfile]:
    queryset = MechanicProfile.objects.select_related("user").filter(
        latitude__isnull=False,
        longitude__isnull=False,
    )

    if only_available:
        queryset = queryset.filter(is_available=True)

    if only_verified:
        queryset = queryset.filter(is_verified=True)

    lat_value = Value(float(latitude))
    lng_value = Value(float(longitude))

    queryset = queryset.annotate(
        distance=ExpressionWrapper(
            EARTH_RADIUS_KM
            * ACos(
                Cos(Radians(lat_value))
                * Cos(Radians(F("latitude")))
                * Cos(Radians(F("longitude")) - Radians(lng_value))
                + Sin(Radians(lat_value)) * Sin(Radians(F("latitude")))
            ),
            output_field=FloatField(),
        )
    )

    if radius_km is not None:
        queryset = queryset.filter(distance__lte=radius_km)

    return queryset.order_by("distance")