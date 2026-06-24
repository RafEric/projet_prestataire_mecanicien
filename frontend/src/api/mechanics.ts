import type {
  MechanicProfile,
  MechanicProfileUpdate,
  NearbyResponse,
  NearbySearchParams,
  PaginatedResponse,
} from "../types/mechanic";
import api from "./axios";

export const mechanicsApi = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<MechanicProfile>> {
    const { data } = await api.get<PaginatedResponse<MechanicProfile>>("/mechanic-profiles/", { params });
    return data;
  },

  async get(id: number): Promise<MechanicProfile> {
    const { data } = await api.get<MechanicProfile>(`/mechanic-profiles/${id}/`);
    return data;
  },

  async getMyProfile(): Promise<MechanicProfile> {
    const { data } = await api.get<MechanicProfile>("/mechanic-profiles/me/");
    return data;
  },

  async create(payload: MechanicProfileUpdate): Promise<MechanicProfile> {
    const { data } = await api.post<MechanicProfile>("/mechanic-profiles/", payload);
    return data;
  },

  async update(id: number, payload: MechanicProfileUpdate & { is_verified?: boolean }): Promise<MechanicProfile> {
    const { data } = await api.patch<MechanicProfile>(`/mechanic-profiles/${id}/`, payload);
    return data;
  },

  async nearby(params: NearbySearchParams): Promise<NearbyResponse> {
    const { data } = await api.get<NearbyResponse>("/mechanic-profiles/nearby/", { params });
    return data;
  },
};