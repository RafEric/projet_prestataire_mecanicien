import type { User } from "../types/auth";
import type { UserAdmin, UserUpdatePayload } from "../types/user";
import type { PaginatedResponse } from "../types/mechanic";
import api from "./axios";

export const usersApi = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<UserAdmin>> {
    const { data } = await api.get<PaginatedResponse<UserAdmin>>("/users/", { params });
    return data;
  },

  async get(id: number): Promise<UserAdmin> {
    const { data } = await api.get<UserAdmin>(`/users/${id}/`);
    return data;
  },

  async update(id: number, payload: UserUpdatePayload): Promise<UserAdmin> {
    const { data } = await api.patch<UserAdmin>(`/users/${id}/`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}/`);
  },

  async updateMe(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>("/auth/me/", payload);
    return data;
  },
};