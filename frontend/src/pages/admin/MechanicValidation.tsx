import { useEffect, useState } from "react";
import { mechanicsApi } from "../../api/mechanics";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import type { MechanicProfile } from "../../types/mechanic";

export default function MechanicValidation() {
  const [pending, setPending] = useState<MechanicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    mechanicsApi.list({ is_verified: false }).then((d) => setPending(d.results)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const validate = async (id: number) => {
    await mechanicsApi.update(id, { is_verified: true });
    setPending((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <PageHeader title="Validation des mécaniciens" subtitle="Profils en attente de vérification" />
      {pending.length === 0 ? (
        <EmptyState title="Aucun profil en attente" description="Tous les mécaniciens sont validés." />
      ) : (
        <div className="cards-grid">
          {pending.map((m) => (
            <div key={m.id} className="info-card">
              <h3>{m.business_name || m.full_name}</h3>
              <p>{m.user.email}</p>
              <p>{m.city} — {m.years_experience} ans d&apos;expérience</p>
              <p className="text-muted">{m.bio || "Pas de description"}</p>
              <button type="button" className="btn-primary btn-sm" onClick={() => validate(m.id)}>
                Valider le profil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}