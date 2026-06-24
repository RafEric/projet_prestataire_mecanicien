import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mechanicsApi } from "../../api/mechanics";
import { serviceRequestsApi } from "../../api/serviceRequests";
import { usersApi } from "../../api/users";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, mechanics: 0, requests: 0, pendingValidation: 0 });
  const [recentRequests, setRecentRequests] = useState<Awaited<ReturnType<typeof serviceRequestsApi.list>>["results"]>([]);

  useEffect(() => {
    const load = async () => {
      const [users, mechanics, requests] = await Promise.all([
        usersApi.list(),
        mechanicsApi.list(),
        serviceRequestsApi.list(),
      ]);
      setStats({
        users: users.count,
        mechanics: mechanics.count,
        requests: requests.count,
        pendingValidation: mechanics.results.filter((m) => !m.is_verified).length,
      });
      setRecentRequests(requests.results.slice(0, 5));
    };
    load().catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader title="Tableau de bord Admin" subtitle="Vue d'ensemble de la plateforme" />
      <div className="stats-grid">
        <div className="stat-card"><span>👥</span><div><strong>{stats.users}</strong><p>Utilisateurs</p></div></div>
        <div className="stat-card"><span>🔧</span><div><strong>{stats.mechanics}</strong><p>Mécaniciens</p></div></div>
        <div className="stat-card"><span>📋</span><div><strong>{stats.requests}</strong><p>Demandes</p></div></div>
        <div className="stat-card stat-warning"><span>✅</span><div><strong>{stats.pendingValidation}</strong><p>À valider</p></div></div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Demandes récentes</h3>
          <Link to="/admin/requests">Voir tout</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Titre</th><th>Client</th><th>Statut</th><th>Date</th></tr>
          </thead>
          <tbody>
            {recentRequests.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.client_name}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}