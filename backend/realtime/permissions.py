from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from service_requests.models import ServiceRequest


@database_sync_to_async
def can_access_service_request(user, request_id: int) -> bool:
    if isinstance(user, AnonymousUser) or not user.is_authenticated:
        return False

    if user.role == "admin" or user.is_staff:
        return True

    try:
        service_request = ServiceRequest.objects.get(pk=request_id)
    except ServiceRequest.DoesNotExist:
        return False

    return user in (service_request.client, service_request.mechanic)