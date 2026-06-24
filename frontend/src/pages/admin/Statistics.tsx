import { useEffect, useState } from "react";
import { mechanicsApi } from "../../api/mechanics";
import { reviewsApi } from "../../api/reviews";
import { serviceRequestsApi } from "../../api/serviceRequests";
import { usersApi } from "../../api/users";
import PageHeader from "../../components/common/PageHeader";

export default function AdminStatistics() {
  const [data, setData] = useState({
    clients: 0,
    mechanics: 0,
    admins: 0,
    requestsByStatus: {} as Record<string, number>,
    avgRating: 0,
    verifiedMechanics: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [users, mechanics, requests, reviews] = await Promise.all([
        usersApi.list(),
        mechanicsApi.list(),
        serviceRequestsApi.list(),
        reviewsApi.list(),
      ]);

      const byStatus: Record<string, number> = {};
      requests.results.forEach((r) => {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      });

      const avgRating = reviews.results.length
        ? reviews.results.reduce((s, r) => s + r.rating, 0) / reviews.results.length
        : 0;

      setData({
        clients: users.results.filter((u) => u.role === "client").length,
        mechanics: users.results.filter((u) => u.role === "mecanicien").length,
        admins: users.results.filter((u) => u.role === "admin").length,
        requestsByStatus: byStatus,
        avgRating: Math.round(avgRating * 10) / 10,
        verifiedMechanics: mechanics.results.filter((m) => m.is_verified).length,
      });
    };
    load().catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader title="Statistiques" subtitle="Indicateurs clés de la plateforme" />
      <div className="stats-grid">
        <div className="stat-card"><strong>{data.clients}</strong><p>Clients</p></div>
        <div className="stat-card"><strong>{data.mechanics}</strong><p>Mécaniciens</p></div>
        <div className="stat-card"><strong>{data.admins}</strong><p>Administrateurs</p></div>
        <div className="stat-card"><strong>{data.verifiedMechanics}</strong><p>Mécaniciens vérifiés</p></div>
        <div className="stat-card"><strong>{data.avgRating}/5</strong><p>Note moyenne</p></div>
      </div>
      <div className="card">
        <h3>Demandes par statut</h3>
        <div className="stats-bars">
          {Object.entries(data.requestsByStatus).map(([status, count]) => (
            <div key={status} className="stat-bar-row">
              <span>{status}</span>
              <div className="stat-bar"><div style={{ width: `${Math.min(count * 20, 100)}%` }} /></div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}