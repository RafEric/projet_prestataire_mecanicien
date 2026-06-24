from realtime.broadcast import broadcast_chat_message, broadcast_request_status
from service_requests.serializers import MessageSerializer, ServiceRequestDetailSerializer


def push_chat_message(message):
    data = MessageSerializer(message).data
    broadcast_chat_message(message.service_request_id, data)
    return data


def push_request_update(service_request):
    data = ServiceRequestDetailSerializer(service_request).data
    broadcast_request_status(service_request.id, data)
    return data