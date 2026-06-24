import type { UserRole } from "../types/auth";

export const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin",
  client: "/client",
  mecanicien: "/mechanic",
};

export function getDashboardPath(role: UserRole): string {
  return DASHBOARD_BY_ROLE[role] ?? "/";
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  client: "Client",
  mecanicien: "Mécanicien",
};