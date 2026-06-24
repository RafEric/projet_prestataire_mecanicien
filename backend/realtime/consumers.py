from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .permissions import can_access_service_request


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close()
            return

        self.group_name = f"user_{user.id}_notifications"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({"type": "connected", "channel": "notifications"})

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send_json({"type": "notification", "payload": event["data"]})


class ServiceRequestConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close()
            return

        self.request_id = int(self.scope["url_route"]["kwargs"]["request_id"])
        allowed = await can_access_service_request(user, self.request_id)
        if not allowed:
            await self.close()
            return

        self.group_name = f"service_request_{self.request_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({
            "type": "connected",
            "channel": "service_request",
            "request_id": self.request_id,
        })

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def chat_message(self, event):
        await self.send_json({"type": "chat.message", "payload": event["data"]})

    async def request_status(self, event):
        await self.send_json({"type": "request.status", "payload": event["data"]})