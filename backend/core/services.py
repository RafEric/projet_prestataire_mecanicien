from core.serializers import NotificationSerializer
from realtime.broadcast import broadcast_notification

from .models import Notification


def notify_user(user, *, title: str, message: str, notification_type: str = Notification.Type.GENERAL, link: str = ""):
    if not user or not user.is_active:
        return None

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
    )

    broadcast_notification(user.id, NotificationSerializer(notification).data)
    return notification