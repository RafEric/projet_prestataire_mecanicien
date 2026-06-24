from django.urls import path

from .consumers import NotificationConsumer, ServiceRequestConsumer

websocket_urlpatterns = [
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    path("ws/requests/<int:request_id>/", ServiceRequestConsumer.as_asgi()),
]