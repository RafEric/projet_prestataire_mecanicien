import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serviceRequestsApi } from "../../api/serviceRequests";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import type { ServiceRequestListItem } from "../../types/serviceRequest";

export default function MechanicRequestsList() {
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    serviceRequestsApi.list().then((d) => setRequests(d.results)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = tab === "available"
    ? requests.filter((r) => r.status === "pending" && !r.mechanic)
    : requests.filter((r) => r.mechanic);

  const accept = async (id: number) => {
    await serviceRequestsApi.assign(id);
    load();
  };

  return (
    <div>
      <PageHeader title="Demandes reçues" subtitle="Acceptez de nouvelles interventions" />
      <div className="tabs">
        <button type="button" className={tab === "available" ? "active" : ""} onClick={() => setTab("available")}>Disponibles</button>
        <button type="button" className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>Mes interventions</button>
      </div>
      {loading ? <p>Chargement...</p> : filtered.length === 0 ? (
        <EmptyState title="Aucune demande" />
      ) : (
        <div className="cards-grid">
          {filtered.map((r) => (
            <div key={r.id} className="info-card">
              <h3>{r.title}</h3>
              <p>{r.client_name} — {r.city}</p>
              <StatusBadge status={r.priority} type="priority" />
              <StatusBadge status={r.status} />
              <div className="card-actions">
                <Link to={`/mechanic/requests/${r.id}`} className="btn-ghost btn-sm">Détail</Link>
                {tab === "available" && (
                  <button type="button" className="btn-primary btn-sm" onClick={() => accept(r.id)}>Accepter</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}