import type { PaginatedResponse } from "../types/mechanic";
import type { Review, ReviewCreate } from "../types/review";
import api from "./axios";

export const reviewsApi = {
  async list(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Review>> {
    const { data } = await api.get<PaginatedResponse<Review>>("/reviews/", { params });
    return data;
  },

  async create(payload: ReviewCreate): Promise<Review> {
    const { data } = await api.post<Review>("/reviews/", payload);
    return data;
  },
};