import type { PaginatedResponse } from "../types/mechanic";
import type {
  ServiceRequestCreate,
  ServiceRequestDetail,
  ServiceRequestListItem,
  ServiceRequestUpdate,
} from "../types/serviceRequest";
import api from "./axios";

export const serviceRequestsApi = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<ServiceRequestListItem>> {
    const { data } = await api.get<PaginatedResponse<ServiceRequestListItem>>("/service-requests/", { params });
    return data;
  },

  async get(id: number): Promise<ServiceRequestDetail> {
    const { data } = await api.get<ServiceRequestDetail>(`/service-requests/${id}/`);
    return data;
  },

  async create(payload: ServiceRequestCreate): Promise<ServiceRequestDetail> {
    const { data } = await api.post<ServiceRequestDetail>("/service-requests/", payload);
    return data;
  },

  async update(id: number, payload: ServiceRequestUpdate): Promise<ServiceRequestDetail> {
    const { data } = await api.patch<ServiceRequestDetail>(`/service-requests/${id}/`, payload);
    return data;
  },

  async assign(id: number, mechanicId?: number): Promise<ServiceRequestDetail> {
    const { data } = await api.post<ServiceRequestDetail>(
      `/service-requests/${id}/assign/`,
      mechanicId ? { mechanic_id: mechanicId } : {},
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/service-requests/${id}/`);
  },
};