import type { AuthTokens, LoginCredentials, RegisterData, User } from "../types/auth";
import api from "./axios";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/token/", credentials);
    return data;
  },

  async register(userData: RegisterData): Promise<{ message: string; user: User }> {
    const { data } = await api.post("/auth/register/", userData);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me/");
    return data;
  },

  async healthCheck(): Promise<{ status: string; message: string }> {
    const { data } = await api.get("/health/");
    return data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string; reset_url?: string }> {
    const { data } = await api.post("/auth/password-reset/", { email });
    return data;
  },

  async confirmPasswordReset(payload: {
    uid: string;
    token: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> {
    const { data } = await api.post("/auth/password-reset/confirm/", payload);
    return data;
  },
};