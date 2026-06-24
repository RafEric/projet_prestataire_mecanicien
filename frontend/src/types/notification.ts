export type NotificationType =
  | "request_assigned"
  | "request_status"
  | "new_message"
  | "new_review"
  | "profile_verified"
  | "general";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  link: string;
  is_read: boolean;
  created_at: string;
}