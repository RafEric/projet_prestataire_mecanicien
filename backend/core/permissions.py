from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "client"


class IsMechanic(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "mecanicien"


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_staff:
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "client", None)
        return owner == request.user


class IsMechanicProfileOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_staff:
            return True
        return obj.user == request.user


class IsServiceRequestParticipantOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_staff:
            return True
        return request.user in (obj.client, obj.mechanic)


class IsMessageParticipantOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_staff:
            return True
        service_request = obj.service_request
        return request.user in (service_request.client, service_request.mechanic)


class IsReviewAuthorOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_staff:
            return True
        if request.method in SAFE_METHODS:
            return True
        return obj.client == request.user