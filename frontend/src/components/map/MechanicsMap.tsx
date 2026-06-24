import { Link } from "react-router-dom";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { MechanicProfile } from "../../types/mechanic";
import FitBounds from "./FitBounds";
import MapRecenter from "./MapRecenter";
import { clientIcon, createMechanicIcon } from "./mapIcons";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs';

interface MechanicsMapProps {
  clientPosition: [number, number];
  mechanics: MechanicProfile[];
  radiusKm: number;
  zoom?: number;
  fitAllMarkers?: boolean;
  className?: string;
}

export default function MechanicsMap({
  clientPosition,
  mechanics,
  radiusKm,
  zoom = 13,
  fitAllMarkers = true,
  className = "leaflet-map",
}: MechanicsMapProps) {
  const mechanicPositions = mechanics
    .filter((m) => m.latitude && m.longitude)
    .map((m) => [parseFloat(m.latitude!), parseFloat(m.longitude!)] as [number, number]);

  const allPositions = [clientPosition, ...mechanicPositions];

  return (
    <MapContainer center={clientPosition} zoom={zoom} className={className} scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={OSM_ATTRIBUTION}
      />

      {!fitAllMarkers && <MapRecenter center={clientPosition} zoom={zoom} />}
      {fitAllMarkers && mechanicPositions.length > 0 && (
        <FitBounds positions={allPositions} />
      )}
      {fitAllMarkers && mechanicPositions.length === 0 && (
        <MapRecenter center={clientPosition} zoom={zoom} />
      )}

      <Circle
        center={clientPosition}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#1e40af",
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 4",
        }}
      />

      <Marker position={clientPosition} icon={clientIcon}>
        <Popup>
          <strong>Votre position</strong>
          <br />
          <small>
            {clientPosition[0].toFixed(5)}, {clientPosition[1].toFixed(5)}
          </small>
        </Popup>
      </Marker>

      {mechanics.map((m) => {
        if (!m.latitude || !m.longitude) return null;
        const position: [number, number] = [parseFloat(m.latitude), parseFloat(m.longitude)];

        return (
          <Marker
            key={m.id}
            position={position}
            icon={createMechanicIcon(m.average_rating)}
          >
            <Popup>
              <div className="map-popup">
                <strong>{m.business_name || m.full_name}</strong>
                <p>{m.city}{m.specialties ? ` — ${m.specialties}` : ""}</p>
                <p>
                  ⭐ {m.average_rating} ({m.total_reviews} avis)
                  {m.distance_km !== undefined && (
                    <> · 📍 {m.distance_km} km</>
                  )}
                </p>
                {m.hourly_rate && <p>{m.hourly_rate} €/h</p>}
                <p className={m.is_available ? "text-success" : "text-warning"}>
                  {m.is_available ? "Disponible" : "Indisponible"}
                </p>
                <Link to={`/client/mechanics/${m.id}`} className="btn-primary btn-sm">
                  Voir le profil
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}