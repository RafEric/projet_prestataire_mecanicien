import type { PaginatedResponse } from "../types/mechanic";
import type { AppNotification } from "../types/notification";
import api from "./axios";

export const notificationsApi = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<AppNotification>> {
    const { data } = await api.get<PaginatedResponse<AppNotification>>("/notifications/", { params });
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>("/notifications/unread-count/");
    return data.count;
  },

  async markRead(id: number): Promise<AppNotification> {
    const { data } = await api.post<AppNotification>(`/notifications/${id}/read/`);
    return data;
  },

  async markAllRead(): Promise<void> {
    await api.post("/notifications/read-all/");
  },
};