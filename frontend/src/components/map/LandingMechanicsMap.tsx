import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { MechanicProfile } from "../../types/mechanic";
import FitBounds from "./FitBounds";
import MapRecenter from "./MapRecenter";
import { clientIcon, createMechanicIcon } from "./mapIcons";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs';

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];

interface LandingMechanicsMapProps {
  mechanics: MechanicProfile[];
  userPosition?: [number, number] | null;
}

function getMechanicPosition(mechanic: MechanicProfile): [number, number] | null {
  if (!mechanic.latitude || !mechanic.longitude) return null;
  return [parseFloat(mechanic.latitude), parseFloat(mechanic.longitude)];
}

export default function LandingMechanicsMap({ mechanics, userPosition }: LandingMechanicsMapProps) {
  const mappedMechanics = mechanics
    .map((mechanic) => ({ mechanic, position: getMechanicPosition(mechanic) }))
    .filter((entry): entry is { mechanic: MechanicProfile; position: [number, number] } => entry.position !== null);

  const mechanicPositions = mappedMechanics.map((entry) => entry.position);
  const fitPositions = userPosition ? [userPosition, ...mechanicPositions] : mechanicPositions;
  const center = mechanicPositions[0] ?? userPosition ?? DEFAULT_CENTER;

  return (
    <MapContainer center={center} zoom={6} className="leaflet-map landing-map" scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={OSM_ATTRIBUTION}
      />

      {fitPositions.length > 1 ? (
        <FitBounds positions={fitPositions} />
      ) : (
        <MapRecenter center={center} zoom={fitPositions.length === 1 ? 12 : 6} />
      )}

      {userPosition && (
        <Marker position={userPosition} icon={clientIcon}>
          <Popup>
            <strong>Votre position</strong>
          </Popup>
        </Marker>
      )}

      {mappedMechanics.map(({ mechanic, position }) => (
        <Marker key={mechanic.id} position={position} icon={createMechanicIcon(mechanic.average_rating)}>
          <Popup>
            <div className="map-popup">
              <strong>{mechanic.business_name || mechanic.full_name}</strong>
              <p>{mechanic.city}{mechanic.specialties ? ` — ${mechanic.specialties}` : ""}</p>
              <p>⭐ {mechanic.average_rating} ({mechanic.total_reviews} avis)</p>
              {mechanic.hourly_rate && <p>{mechanic.hourly_rate} €/h</p>}
              <p className={mechanic.is_available ? "text-success" : "text-warning"}>
                {mechanic.is_available ? "Disponible" : "Indisponible"}
              </p>
              <Link to={`/mechanics/${mechanic.id}`} className="btn-primary btn-sm">
                Voir le profil
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}