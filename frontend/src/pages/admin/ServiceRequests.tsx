import { useEffect, useState } from "react";
import { serviceRequestsApi } from "../../api/serviceRequests";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import type { ServiceRequestListItem } from "../../types/serviceRequest";

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : undefined;
    serviceRequestsApi.list(params).then((d) => setRequests(d.results)).catch(console.error).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <PageHeader title="Gestion des demandes" subtitle="Toutes les demandes d'intervention" />
      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptée</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>
      {loading ? <p>Chargement...</p> : requests.length === 0 ? (
        <EmptyState title="Aucune demande" />
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Titre</th><th>Client</th><th>Mécanicien</th><th>Priorité</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.client_name}</td>
                  <td>{r.mechanic_name || "—"}</td>
                  <td><StatusBadge status={r.priority} type="priority" /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}