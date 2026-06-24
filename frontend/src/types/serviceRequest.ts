import type { User } from "./auth";

export type ServiceRequestStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";

export interface ServiceRequestListItem {
  id: number;
  title: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  client: number;
  client_name: string;
  mechanic: number | null;
  mechanic_name: string;
  city: string;
  scheduled_at: string | null;
  estimated_price: string | null;
  created_at: string;
}

export interface ServiceRequestDetail {
  id: number;
  client: User;
  mechanic: User | null;
  title: string;
  description: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number | null;
  license_plate: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  address: string;
  city: string;
  postal_code: string;
  scheduled_at: string | null;
  estimated_price: string | null;
  final_price: string | null;
  completed_at: string | null;
  messages_count: number;
  has_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestCreate {
  title: string;
  description: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  license_plate?: string;
  priority?: ServiceRequestPriority;
  address?: string;
  city?: string;
  postal_code?: string;
  scheduled_at?: string;
  estimated_price?: number;
}

export interface ServiceRequestUpdate {
  title?: string;
  description?: string;
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  final_price?: number;
  mechanic?: number;
}