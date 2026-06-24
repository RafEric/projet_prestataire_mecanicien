import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serviceRequestsApi } from "../../api/serviceRequests";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import type { ServiceRequestListItem } from "../../types/serviceRequest";

export default function MechanicRequestHistory() {
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serviceRequestsApi.list({ status: "completed" })
      .then((d) => setRequests(d.results))
      .catch(() => serviceRequestsApi.list().then((d) => setRequests(d.results.filter((r) => ["completed", "cancelled"].includes(r.status)))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Historique des interventions" subtitle="Interventions terminées et annulées" />
      {loading ? <p>Chargement...</p> : requests.length === 0 ? (
        <EmptyState title="Aucun historique" />
      ) : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Titre</th><th>Client</th><th>Statut</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.client_name}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td><Link to={`/mechanic/requests/${r.id}`}>Détail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}