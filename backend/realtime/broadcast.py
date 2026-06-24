from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def _group_send(group_name: str, message: dict):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(group_name, message)


def broadcast_notification(user_id: int, notification_data: dict):
    _group_send(
        f"user_{user_id}_notifications",
        {"type": "send.notification", "data": notification_data},
    )


def broadcast_chat_message(request_id: int, message_data: dict):
    _group_send(
        f"service_request_{request_id}",
        {"type": "chat.message", "data": message_data},
    )


def broadcast_request_status(request_id: int, status_data: dict):
    _group_send(
        f"service_request_{request_id}",
        {"type": "request.status", "data": status_data},
    )