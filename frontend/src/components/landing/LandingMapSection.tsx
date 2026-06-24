import { lazy, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import type { MechanicProfile } from "../../types/mechanic";
import type { GeoPosition } from "../../hooks/useGeolocation";

const LandingMechanicsMap = lazy(() => import("../map/LandingMechanicsMap"));

interface LandingMapSectionProps {
  mechanics: MechanicProfile[];
  loading: boolean;
  userPosition: GeoPosition | null;
  geoLoading: boolean;
  geoError: string | null;
  onRefreshGeo: () => void;
}

export default function LandingMapSection({
  mechanics,
  loading,
  userPosition,
  geoLoading,
  geoError,
  onRefreshGeo,
}: LandingMapSectionProps) {
  const mechanicsWithCoords = useMemo(
    () => mechanics.filter((m) => m.latitude && m.longitude),
    [mechanics],
  );

  const userMapPosition = userPosition
    ? ([userPosition.latitude, userPosition.longitude] as [number, number])
    : null;

  return (
    <section id="map" className="landing-section landing-section-alt">
      <div className="landing-section-header">
        <h2>Trouvez un mécanicien près de chez vous</h2>
        <p>Visualisez les professionnels disponibles sur la carte interactive.</p>
      </div>

      <div className="landing-map-panel card">
        <div className="landing-map-toolbar">
          <div className="map-legend">
            <span className="legend-item legend-mechanic">
              <span className="legend-dot mechanic" /> Mécanicien
            </span>
            {userMapPosition && (
              <span className="legend-item legend-client">
                <span className="legend-dot client" /> Votre position
              </span>
            )}
          </div>
          <button type="button" className="btn-secondary btn-sm" onClick={onRefreshGeo} disabled={geoLoading}>
            {geoLoading ? "Localisation..." : "📍 Ma position"}
          </button>
        </div>

        {geoError && !userMapPosition && (
          <p className="landing-map-hint text-muted">{geoError}</p>
        )}

        {loading ? (
          <LoadingSpinner label="Chargement de la carte..." />
        ) : mechanicsWithCoords.length === 0 ? (
          <div className="empty-state landing-map-empty">
            <h3>Aucun mécanicien géolocalisé pour le moment</h3>
            <p>Les profils avec coordonnées GPS apparaîtront ici automatiquement.</p>
          </div>
        ) : (
          <div className="landing-map-container">
            <Suspense fallback={<LoadingSpinner label="Initialisation de la carte..." />}>
              <LandingMechanicsMap mechanics={mechanics} userPosition={userMapPosition} />
            </Suspense>
          </div>
        )}

        <p className="landing-map-footer">
          {mechanicsWithCoords.length} mécanicien{mechanicsWithCoords.length > 1 ? "s" : ""}{" "}
          affiché{mechanicsWithCoords.length > 1 ? "s" : ""} sur la carte.
          {" "}
          <Link to="/register">Créez un compte</Link> pour les contacter et lancer une demande.
        </p>
      </div>
    </section>
  );
}