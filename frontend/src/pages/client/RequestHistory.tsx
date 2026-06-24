import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serviceRequestsApi } from "../../api/serviceRequests";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import type { ServiceRequestListItem } from "../../types/serviceRequest";

export default function RequestHistory() {
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serviceRequestsApi.list().then((d) => setRequests(d.results)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Historique des demandes" subtitle="Toutes vos demandes d'intervention" action={<Link to="/client/requests/new" className="btn-primary btn-sm">Nouvelle demande</Link>} />
      {loading ? <p>Chargement...</p> : requests.length === 0 ? (
        <EmptyState title="Aucune demande" action={<Link to="/client/requests/new" className="btn-primary btn-sm">Créer une demande</Link>} />
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Titre</th><th>Mécanicien</th><th>Priorité</th><th>Statut</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.mechanic_name || "—"}</td>
                  <td><StatusBadge status={r.priority} type="priority" /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td><Link to={`/client/requests/${r.id}`}>Détail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}