import type { User } from "./auth";

export interface Review {
  id: number;
  service_request: number;
  service_request_title: string;
  client: User;
  mechanic: User;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreate {
  service_request: number;
  rating: number;
  comment?: string;
}