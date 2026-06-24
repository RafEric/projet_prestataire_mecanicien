import type { User, UserRole } from "./auth";

export interface UserAdmin extends User {
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  username?: string;
  role?: UserRole;
  is_active?: boolean;
}