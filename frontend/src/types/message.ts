import type { User } from "./auth";

export interface Message {
  id: number;
  service_request: number;
  sender: User;
  content: string;
  is_read: boolean;
  created_at: string;
}