import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "../../api/notifications";
import { useWebSocket } from "../../contexts/WebSocketContext";
import type { AppNotification } from "../../types/notification";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { subscribeNotifications } = useWebSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(list.results.slice(0, 10));
      setUnreadCount(count);
    } catch {
      /* silencieux si non connecté */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return subscribeNotifications((data) => {
      const notification = data.payload as AppNotification;
      if (!notification?.id) return;

      setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)].slice(0, 10));
      if (!notification.is_read) {
        setUnreadCount((c) => c + 1);
      }
    });
  }, [subscribeNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await notificationsApi.markRead(notification.id);
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        type="button"
        className="notification-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="btn-ghost btn-sm" onClick={markAllRead}>
                Tout marquer lu
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">Aucune notification</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`notification-item${n.is_read ? "" : " unread"}`}
                    onClick={() => handleClick(n)}
                  >
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                    <small>{new Date(n.created_at).toLocaleString("fr-FR")}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}