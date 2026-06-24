import { PRIORITY_LABELS, STATUS_LABELS } from "../../utils/roles";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "priority" | "role" | "verified";
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  client: "Client",
  mecanicien: "Mécanicien",
};

export default function StatusBadge({ status, type = "status" }: StatusBadgeProps) {
  const label =
    type === "priority"
      ? PRIORITY_LABELS[status] ?? status
      : type === "role"
        ? ROLE_LABELS[status] ?? status
        : type === "verified"
          ? status === "true" || status === "verified" ? "Vérifié" : "Non vérifié"
          : STATUS_LABELS[status] ?? status;

  return <span className={`badge badge-${type} badge-${status}`}>{label}</span>;
}