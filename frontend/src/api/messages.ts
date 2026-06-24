import type { PaginatedResponse } from "../types/mechanic";
import type { Message } from "../types/message";
import api from "./axios";

export const messagesApi = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Message>> {
    const { data } = await api.get<PaginatedResponse<Message>>("/messages/", { params });
    return data;
  },

  async getForRequest(requestId: number): Promise<Message[]> {
    const { data } = await api.get<Message[] | PaginatedResponse<Message>>(
      `/service-requests/${requestId}/messages/`,
    );
    return Array.isArray(data) ? data : data.results;
  },

  async send(requestId: number, content: string): Promise<Message> {
    const { data } = await api.post<Message>(`/service-requests/${requestId}/messages/send/`, { content });
    return data;
  },

  async markRead(id: number): Promise<Message> {
    const { data } = await api.patch<Message>(`/messages/${id}/`, { is_read: true });
    return data;
  },
};