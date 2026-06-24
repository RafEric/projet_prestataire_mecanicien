import type { User } from "./auth";

export interface MechanicProfile {
  id: number;
  user: User;
  user_id: number;
  full_name: string;
  business_name: string;
  bio: string;
  specialties: string;
  address: string;
  city: string;
  postal_code: string;
  latitude: string | null;
  longitude: string | null;
  hourly_rate: string | null;
  years_experience: number;
  is_verified: boolean;
  is_available: boolean;
  average_rating: string;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  distance_km?: number;
}

export interface MechanicProfileUpdate {
  business_name?: string;
  bio?: string;
  specialties?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  hourly_rate?: number;
  years_experience?: number;
  is_available?: boolean;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  only_verified?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NearbyResponse {
  count: number;
  latitude: number;
  longitude: number;
  radius_km: number;
  results: MechanicProfile[];
}