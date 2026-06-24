export type WsEventHandler = (data: Record<string, unknown>) => void;

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

export function getWsUrl(path: string): string {
  const token = localStorage.getItem("access_token");
  const separator = path.includes("?") ? "&" : "?";
  return `${WS_BASE_URL}${path}${separator}token=${token}`;
}

export class ReconnectingWebSocket {
  private socket: WebSocket | null = null;
  private handlers: Map<string, Set<WsEventHandler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  connect() {
    this.closed = false;
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(getWsUrl(this.path));

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        const type = data.type as string;
        if (!type) return;
        const handlers = this.handlers.get(type);
        handlers?.forEach((handler) => handler(data));
        const wildcard = this.handlers.get("*");
        wildcard?.forEach((handler) => handler(data));
      } catch {
        /* ignore malformed messages */
      }
    };

    this.socket.onclose = () => {
      if (!this.closed) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };
  }

  on(type: string, handler: WsEventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }
}