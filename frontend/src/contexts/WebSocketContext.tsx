import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { ReconnectingWebSocket, type WsEventHandler } from "../lib/websocket";
import type { AppNotification } from "../types/notification";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface WebSocketContextType {
  subscribeNotifications: (handler: WsEventHandler) => () => void;
  getRequestSocket: (requestId: number) => ReconnectingWebSocket;
  releaseRequestSocket: (requestId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const notificationSocket = useRef<ReconnectingWebSocket | null>(null);
  const requestSockets = useRef<Map<number, ReconnectingWebSocket>>(new Map());
  const requestRefCounts = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (!isAuthenticated) {
      notificationSocket.current?.disconnect();
      notificationSocket.current = null;
      requestSockets.current.forEach((s) => s.disconnect());
      requestSockets.current.clear();
      requestRefCounts.current.clear();
      return;
    }

    const socket = new ReconnectingWebSocket("/ws/notifications/");
    notificationSocket.current = socket;

    socket.on("notification", (data) => {
      const payload = data.payload as AppNotification;
      if (payload?.title) {
        showToast(payload.title, "info");
      }
    });

    socket.connect();

    return () => {
      socket.disconnect();
      notificationSocket.current = null;
    };
  }, [isAuthenticated, showToast]);

  const subscribeNotifications = useCallback((handler: WsEventHandler) => {
    const socket = notificationSocket.current;
    if (!socket) return () => undefined;
    return socket.on("notification", handler);
  }, []);

  const getRequestSocket = useCallback((requestId: number) => {
    const count = requestRefCounts.current.get(requestId) ?? 0;
    requestRefCounts.current.set(requestId, count + 1);

    let socket = requestSockets.current.get(requestId);
    if (!socket) {
      socket = new ReconnectingWebSocket(`/ws/requests/${requestId}/`);
      socket.connect();
      requestSockets.current.set(requestId, socket);
    }
    return socket;
  }, []);

  const releaseRequestSocket = useCallback((requestId: number) => {
    const count = (requestRefCounts.current.get(requestId) ?? 1) - 1;
    if (count <= 0) {
      requestRefCounts.current.delete(requestId);
      requestSockets.current.get(requestId)?.disconnect();
      requestSockets.current.delete(requestId);
    } else {
      requestRefCounts.current.set(requestId, count);
    }
  }, []);

  const value = useMemo(
    () => ({ subscribeNotifications, getRequestSocket, releaseRequestSocket }),
    [subscribeNotifications, getRequestSocket, releaseRequestSocket],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket doit être utilisé dans un WebSocketProvider");
  }
  return context;
}