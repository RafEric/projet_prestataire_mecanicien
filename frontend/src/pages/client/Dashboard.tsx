import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serviceRequestsApi } from "../../api/serviceRequests";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

export default function ClientDashboard() {
  const [requests, setRequests] = useState<Awaited<ReturnType<typeof serviceRequestsApi.list>>["results"]>([]);

  useEffect(() => {
    serviceRequestsApi.list().then((d) => setRequests(d.results.slice(0, 5))).catch(console.error);
  }, []);

  const active = requests.filter((r) => !["completed", "cancelled"].includes(r.status)).length;

  return (
    <div>
      <PageHeader
        title="Tableau de bord Client"
        subtitle="Gérez vos demandes d'intervention"
        action={<Link to="/client/requests/new" className="btn-primary btn-sm">Nouvelle demande</Link>}
      />
      <div className="stats-grid">
        <div className="stat-card"><strong>{requests.length}</strong><p>Total demandes</p></div>
        <div className="stat-card"><strong>{active}</strong><p>En cours</p></div>
      </div>
      <div className="quick-actions">
        <Link to="/client/search" className="action-card">🔍 Rechercher un mécanicien</Link>
        <Link to="/client/map" className="action-card">🗺️ Voir la carte</Link>
        <Link to="/client/chat" className="action-card">💬 Messages</Link>
      </div>
      <div className="card">
        <h3>Dernières demandes</h3>
        {requests.length === 0 ? (
          <p className="text-muted">Aucune demande pour le moment.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Titre</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td><Link to={`/client/requests/${r.id}`}>{r.title}</Link></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}