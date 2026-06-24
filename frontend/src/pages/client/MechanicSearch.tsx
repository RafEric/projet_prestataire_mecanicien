import { useState } from "react";
import { Link } from "react-router-dom";
import { mechanicsApi } from "../../api/mechanics";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import type { MechanicProfile } from "../../types/mechanic";

export default function MechanicSearch() {
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [params, setParams] = useState({ latitude: "", longitude: "", radius: "30", only_verified: false });

  const searchNearby = async () => {
    if (!params.latitude || !params.longitude) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await mechanicsApi.nearby({
        latitude: parseFloat(params.latitude),
        longitude: parseFloat(params.longitude),
        radius: parseFloat(params.radius),
        only_verified: params.only_verified,
      });
      setMechanics(data.results);
    } catch {
      setMechanics([]);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setParams((p) => ({
        ...p,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    });
  };

  return (
    <div>
      <PageHeader title="Recherche de mécaniciens" subtitle="Trouvez les professionnels les plus proches" />
      <div className="card search-panel">
        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input value={params.latitude} onChange={(e) => setParams({ ...params, latitude: e.target.value })} placeholder="48.8566" />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input value={params.longitude} onChange={(e) => setParams({ ...params, longitude: e.target.value })} placeholder="2.3522" />
          </div>
          <div className="form-group">
            <label>Rayon (km)</label>
            <input type="number" value={params.radius} onChange={(e) => setParams({ ...params, radius: e.target.value })} />
          </div>
        </div>
        <div className="search-actions">
          <button type="button" className="btn-secondary btn-sm" onClick={useMyLocation}>📍 Ma position</button>
          <label className="checkbox-label">
            <input type="checkbox" checked={params.only_verified} onChange={(e) => setParams({ ...params, only_verified: e.target.checked })} />
            Vérifiés uniquement
          </label>
          <button type="button" className="btn-primary btn-sm" onClick={searchNearby} disabled={loading}>
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </div>
      </div>
      {loading ? <p>Recherche en cours...</p> : searched && mechanics.length === 0 ? (
        <EmptyState title="Aucun mécanicien trouvé" description="Élargissez le rayon de recherche." />
      ) : (
        <div className="cards-grid">
          {mechanics.map((m) => (
            <Link key={m.id} to={`/client/mechanics/${m.id}`} className="info-card info-card-link">
              <h3>{m.business_name || m.full_name}</h3>
              <p>{m.city} — {m.specialties}</p>
              <div className="info-card-meta">
                <span>⭐ {m.average_rating}</span>
                {m.distance_km !== undefined && <span>📍 {m.distance_km} km</span>}
                <span>{m.hourly_rate ? `${m.hourly_rate} €/h` : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}