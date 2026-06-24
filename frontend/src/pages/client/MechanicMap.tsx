import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mechanicsApi } from "../../api/mechanics";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageHeader from "../../components/common/PageHeader";
import MechanicsMap from "../../components/map/MechanicsMap";
import { useGeolocation } from "../../hooks/useGeolocation";
import type { MechanicProfile } from "../../types/mechanic";

export default function MechanicMap() {
  const { position, error, loading: geoLoading, refresh: refreshGeo } = useGeolocation();
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [radius, setRadius] = useState(30);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMechanics = useCallback(async (lat: number, lng: number, searchRadius: number) => {
    setLoadingMechanics(true);
    setLoadError(null);
    try {
      const data = await mechanicsApi.nearby({
        latitude: lat,
        longitude: lng,
        radius: searchRadius,
      });
      setMechanics(data.results);
    } catch {
      setMechanics([]);
      setLoadError("Impossible de charger les mécaniciens proches.");
    } finally {
      setLoadingMechanics(false);
    }
  }, []);

  useEffect(() => {
    if (position) {
      loadMechanics(position.latitude, position.longitude, radius);
    }
  }, [position, radius, loadMechanics]);

  const handleRefresh = () => {
    refreshGeo();
  };

  const isLoading = geoLoading || loadingMechanics;

  return (
    <div className="map-page">
      <PageHeader
        title="Carte des mécaniciens"
        subtitle="OpenStreetMap — mécaniciens disponibles autour de vous"
        action={
          <button type="button" className="btn-secondary btn-sm" onClick={handleRefresh}>
            📍 Actualiser ma position
          </button>
        }
      />

      <div className="map-controls card">
        <div className="map-controls-row">
          <label htmlFor="radius">
            Rayon de recherche : <strong>{radius} km</strong>
          </label>
          <input
            id="radius"
            type="range"
            min={5}
            max={100}
            step={5}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
        </div>
        <div className="map-legend">
          <span className="legend-item legend-client"><span className="legend-dot client" /> Votre position</span>
          <span className="legend-item legend-mechanic"><span className="legend-dot mechanic" /> Mécanicien</span>
          <span className="legend-item"><span className="legend-circle" /> Zone de recherche ({radius} km)</span>
        </div>
      </div>

      {geoLoading && !position ? (
        <LoadingSpinner label="Localisation en cours..." />
      ) : error && !position ? (
        <div className="card map-error">
          <p className="error-message">{error}</p>
          <button type="button" className="btn-primary btn-sm" onClick={handleRefresh}>
            Réessayer
          </button>
        </div>
      ) : position ? (
        <div className="map-layout">
          <div className="map-container">
            {isLoading && <div className="map-loading-overlay">Chargement des mécaniciens...</div>}
            <MechanicsMap
              clientPosition={[position.latitude, position.longitude]}
              mechanics={mechanics}
              radiusKm={radius}
            />
          </div>

          <aside className="map-sidebar card">
            <h3>Mécaniciens proches ({mechanics.length})</h3>
            {loadError && <p className="error-message">{loadError}</p>}
            {mechanics.length === 0 && !isLoading ? (
              <p className="text-muted">Aucun mécanicien dans ce rayon. Élargissez la zone de recherche.</p>
            ) : (
              <ul className="map-mechanic-list">
                {mechanics.map((m) => (
                  <li key={m.id}>
                    <Link to={`/client/mechanics/${m.id}`} className="map-mechanic-item">
                      <div>
                        <strong>{m.business_name || m.full_name}</strong>
                        <span>{m.city}</span>
                      </div>
                      <div className="map-mechanic-meta">
                        {m.distance_km !== undefined && <span>📍 {m.distance_km} km</span>}
                        <span>⭐ {m.average_rating}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}