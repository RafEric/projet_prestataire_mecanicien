import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mechanicsApi } from "../../api/mechanics";
import { serviceRequestsApi } from "../../api/serviceRequests";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

export default function MechanicDashboard() {
  const [pending, setPending] = useState(0);
  const [active, setActive] = useState(0);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof mechanicsApi.getMyProfile>> | null>(null);
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof serviceRequestsApi.list>>["results"]>([]);

  useEffect(() => {
    const load = async () => {
      const requests = await serviceRequestsApi.list();
      setPending(requests.results.filter((r) => r.status === "pending" && !r.mechanic).length);
      setActive(requests.results.filter((r) => ["accepted", "in_progress"].includes(r.status)).length);
      setRecent(requests.results.slice(0, 5));
      try {
        const p = await mechanicsApi.getMyProfile();
        setProfile(p);
      } catch {
        setProfile(null);
      }
    };
    load().catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader title="Tableau de bord Mécanicien" subtitle="Gérez vos interventions" />
      <div className="stats-grid">
        <div className="stat-card"><strong>{pending}</strong><p>Demandes disponibles</p></div>
        <div className="stat-card"><strong>{active}</strong><p>En cours</p></div>
        <div className="stat-card"><strong>{profile?.average_rating ?? "—"}</strong><p>Note moyenne</p></div>
        <div className="stat-card"><strong>{profile?.is_available ? "Oui" : "Non"}</strong><p>Disponible</p></div>
      </div>
      <div className="quick-actions">
        <Link to="/mechanic/requests" className="action-card">📥 Voir les demandes</Link>
        <Link to="/mechanic/availability" className="action-card">🕐 Disponibilité</Link>
        <Link to="/mechanic/profile" className="action-card">👤 Mon profil</Link>
      </div>
      <div className="card">
        <h3>Interventions récentes</h3>
        <table className="data-table">
          <thead><tr><th>Titre</th><th>Client</th><th>Statut</th></tr></thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/mechanic/requests/${r.id}`}>{r.title}</Link></td>
                <td>{r.client_name}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}