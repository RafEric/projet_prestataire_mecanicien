import type { UserRole } from "../types/auth";

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Tableau de bord", path: "/admin", icon: "📊" },
  { label: "Utilisateurs", path: "/admin/users", icon: "👥" },
  { label: "Mécaniciens", path: "/admin/mechanics", icon: "🔧" },
  { label: "Validation", path: "/admin/validation", icon: "✅" },
  { label: "Demandes", path: "/admin/requests", icon: "📋" },
  { label: "Statistiques", path: "/admin/statistics", icon: "📈" },
];

export const CLIENT_NAV: NavItem[] = [
  { label: "Tableau de bord", path: "/client", icon: "📊" },
  { label: "Rechercher", path: "/client/search", icon: "🔍" },
  { label: "Carte", path: "/client/map", icon: "🗺️" },
  { label: "Nouvelle demande", path: "/client/requests/new", icon: "➕" },
  { label: "Mes demandes", path: "/client/requests", icon: "📋" },
  { label: "Messages", path: "/client/chat", icon: "💬" },
  { label: "Mon profil", path: "/client/profile", icon: "👤" },
];

export const MECHANIC_NAV: NavItem[] = [
  { label: "Tableau de bord", path: "/mechanic", icon: "📊" },
  { label: "Demandes reçues", path: "/mechanic/requests", icon: "📥" },
  { label: "Historique", path: "/mechanic/history", icon: "📋" },
  { label: "Disponibilité", path: "/mechanic/availability", icon: "🕐" },
  { label: "Mon profil", path: "/mechanic/profile", icon: "👤" },
  { label: "Avis reçus", path: "/mechanic/reviews", icon: "⭐" },
];

export function getNavByRole(role: UserRole): NavItem[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV;
    case "client":
      return CLIENT_NAV;
    case "mecanicien":
      return MECHANIC_NAV;
    default:
      return [];
  }
}