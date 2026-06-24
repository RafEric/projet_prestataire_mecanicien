import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mechanicsApi } from "../../api/mechanics";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import type { MechanicProfile } from "../../types/mechanic";

export default function AdminMechanics() {
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mechanicsApi.list().then((d) => setMechanics(d.results)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <PageHeader title="Gestion des mécaniciens" subtitle={`${mechanics.length} profils`} action={<Link to="/admin/validation" className="btn-primary btn-sm">Validation</Link>} />
      {mechanics.length === 0 ? (
        <EmptyState title="Aucun mécanicien" />
      ) : (
        <div className="cards-grid">
          {mechanics.map((m) => (
            <div key={m.id} className="info-card">
              <h3>{m.business_name || m.full_name}</h3>
              <p>{m.city} — {m.specialties || "Sans spécialité"}</p>
              <div className="info-card-meta">
                <span>⭐ {m.average_rating} ({m.total_reviews})</span>
                <span className={m.is_verified ? "text-success" : "text-warning"}>
                  {m.is_verified ? "Vérifié" : "Non vérifié"}
                </span>
                <span>{m.is_available ? "Disponible" : "Indisponible"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}