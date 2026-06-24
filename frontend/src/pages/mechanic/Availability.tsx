import { useEffect, useState } from "react";
import { mechanicsApi } from "../../api/mechanics";
import PageHeader from "../../components/common/PageHeader";
import type { MechanicProfile } from "../../types/mechanic";

export default function MechanicAvailability() {
  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mechanicsApi.getMyProfile().then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    if (!profile) return;
    const updated = await mechanicsApi.update(profile.id, { is_available: !profile.is_available });
    setProfile(updated);
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <PageHeader title="Gestion de disponibilité" subtitle="Indiquez si vous acceptez de nouvelles demandes" />
      {!profile ? (
        <div className="card">
          <p>Vous n&apos;avez pas encore de profil mécanicien.</p>
          <a href="/mechanic/profile" className="btn-primary btn-sm">Créer mon profil</a>
        </div>
      ) : (
        <div className="card availability-card">
          <div className={`availability-status${profile.is_available ? " available" : ""}`}>
            <span className="status-dot" />
            <div>
              <h3>{profile.is_available ? "Vous êtes disponible" : "Vous êtes indisponible"}</h3>
              <p>{profile.is_available ? "Les clients peuvent vous trouver et vous contacter." : "Vous n'apparaissez pas dans les recherches."}</p>
            </div>
          </div>
          <button type="button" className="btn-primary" onClick={toggle}>
            {profile.is_available ? "Passer en indisponible" : "Passer en disponible"}
          </button>
        </div>
      )}
    </div>
  );
}