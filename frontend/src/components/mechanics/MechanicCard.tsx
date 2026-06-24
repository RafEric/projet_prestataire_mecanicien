import { Link } from "react-router-dom";
import type { MechanicProfile } from "../../types/mechanic";

interface MechanicCardProps {
  mechanic: MechanicProfile;
  to: string;
}

export default function MechanicCard({ mechanic, to }: MechanicCardProps) {
  const name = mechanic.business_name || mechanic.full_name;
  const specialties = mechanic.specialties || "Mécanicien généraliste";

  return (
    <Link to={to} className="mechanic-card">
      <div className="mechanic-card-header">
        <div className="mechanic-card-avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3>{name}</h3>
          <p className="mechanic-card-city">{mechanic.city || "Ville non renseignée"}</p>
        </div>
        {mechanic.is_verified && <span className="badge badge-verified">Vérifié</span>}
      </div>
      <p className="mechanic-card-specialties">{specialties}</p>
      <div className="mechanic-card-meta">
        <span>⭐ {mechanic.average_rating}</span>
        <span>{mechanic.total_reviews} avis</span>
        {mechanic.hourly_rate && <span>{mechanic.hourly_rate} €/h</span>}
        {mechanic.distance_km !== undefined && <span>📍 {mechanic.distance_km} km</span>}
        <span className={mechanic.is_available ? "text-success" : "text-muted"}>
          {mechanic.is_available ? "Disponible" : "Indisponible"}
        </span>
      </div>
    </Link>
  );
}