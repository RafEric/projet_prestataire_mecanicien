import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import type { Message } from "../types/message";
import type { ServiceRequestDetail } from "../types/serviceRequest";

interface UseServiceRequestSocketOptions {
  requestId: number | null;
  onMessage?: (message: Message) => void;
  onStatusUpdate?: (request: ServiceRequestDetail) => void;
}

export function useServiceRequestSocket({
  requestId,
  onMessage,
  onStatusUpdate,
}: UseServiceRequestSocketOptions) {
  const { getRequestSocket, releaseRequestSocket } = useWebSocket();

  useEffect(() => {
    if (!requestId) return;

    const socket = getRequestSocket(requestId);

    const unsubMessage = onMessage
      ? socket.on("chat.message", (data) => {
          onMessage(data.payload as Message);
        })
      : () => undefined;

    const unsubStatus = onStatusUpdate
      ? socket.on("request.status", (data) => {
          onStatusUpdate(data.payload as ServiceRequestDetail);
        })
      : () => undefined;

    return () => {
      unsubMessage();
      unsubStatus();
      releaseRequestSocket(requestId);
    };
  }, [requestId, onMessage, onStatusUpdate, getRequestSocket, releaseRequestSocket]);
}