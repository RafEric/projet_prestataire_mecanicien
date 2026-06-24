import django_filters

from .models import Message, Review, ServiceRequest


class ServiceRequestFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=ServiceRequest.Status.choices)
    priority = django_filters.ChoiceFilter(choices=ServiceRequest.Priority.choices)
    city = django_filters.CharFilter(lookup_expr="icontains")
    client = django_filters.NumberFilter(field_name="client_id")
    mechanic = django_filters.NumberFilter(field_name="mechanic_id")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = ServiceRequest
        fields = ["status", "priority", "city", "client", "mechanic"]


class MessageFilter(django_filters.FilterSet):
    service_request = django_filters.NumberFilter(field_name="service_request_id")
    is_read = django_filters.BooleanFilter()
    sender = django_filters.NumberFilter(field_name="sender_id")

    class Meta:
        model = Message
        fields = ["service_request", "is_read", "sender"]


class ReviewFilter(django_filters.FilterSet):
    mechanic = django_filters.NumberFilter(field_name="mechanic_id")
    client = django_filters.NumberFilter(field_name="client_id")
    rating = django_filters.NumberFilter()
    rating_min = django_filters.NumberFilter(field_name="rating", lookup_expr="gte")
    rating_max = django_filters.NumberFilter(field_name="rating", lookup_expr="lte")

    class Meta:
        model = Review
        fields = ["mechanic", "client", "rating"]