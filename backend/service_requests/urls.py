from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MessageViewSet, ReviewViewSet, ServiceRequestViewSet

router = DefaultRouter()
router.register(r"service-requests", ServiceRequestViewSet, basename="service-request")
router.register(r"messages", MessageViewSet, basename="message")
router.register(r"reviews", ReviewViewSet, basename="review")

urlpatterns = [
    path("", include(router.urls)),
]