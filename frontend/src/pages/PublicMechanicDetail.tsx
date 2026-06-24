import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mechanicsApi } from "../api/mechanics";
import { reviewsApi } from "../api/reviews";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import type { MechanicProfile } from "../types/mechanic";
import type { Review } from "../types/review";

export default function PublicMechanicDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [mechanic, setMechanic] = useState<MechanicProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const m = await mechanicsApi.get(parseInt(id));
      setMechanic(m);
      const r = await reviewsApi.list({ mechanic: m.user_id });
      setReviews(r.results);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!mechanic) {
    return (
      <div className="landing-section">
        <p>Mécanicien introuvable.</p>
        <Link to="/" className="btn-secondary btn-sm">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  const name = mechanic.business_name || mechanic.full_name;
  const canRequest = isAuthenticated && user?.role === "client";

  return (
    <div className="public-mechanic-detail">
      <div className="landing-section">
        <Link to="/#mechanics" className="back-link">← Retour aux mécaniciens</Link>
        <div className="public-mechanic-hero">
          <div>
            <h1>{name}</h1>
            <p className="public-mechanic-subtitle">
              {mechanic.city} — {mechanic.specialties || "Mécanicien généraliste"}
            </p>
            <div className="detail-badges">
              {mechanic.is_verified && <span className="badge badge-verified">Profil vérifié</span>}
              <span className={`badge ${mechanic.is_available ? "badge-completed" : "badge-cancelled"}`}>
                {mechanic.is_available ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>
          {canRequest ? (
            <Link to="/client/requests/new" className="btn-primary">Créer une demande</Link>
          ) : (
            <Link to="/register" className="btn-primary">Créer un compte pour contacter</Link>
          )}
        </div>
      </div>

      <div className="landing-section">
        <div className="detail-grid">
          <div className="card">
            <h3>Informations</h3>
            <ul className="detail-list">
              <li><strong>Expérience :</strong> {mechanic.years_experience} ans</li>
              <li><strong>Tarif horaire :</strong> {mechanic.hourly_rate ? `${mechanic.hourly_rate} €` : "Non renseigné"}</li>
              <li><strong>Note :</strong> ⭐ {mechanic.average_rating} ({mechanic.total_reviews} avis)</li>
              <li><strong>Adresse :</strong> {mechanic.address}, {mechanic.postal_code} {mechanic.city}</li>
            </ul>
            {mechanic.bio && <p className="bio-text">{mechanic.bio}</p>}
          </div>
          <div className="card">
            <h3>Avis clients ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-muted">Aucun avis pour le moment.</p>
            ) : (
              reviews.slice(0, 5).map((r) => (
                <div key={r.id} className="review-item">
                  <strong>{"⭐".repeat(r.rating)}</strong>
                  <p>{r.comment || "Pas de commentaire"}</p>
                  <small>{r.client.first_name} — {new Date(r.created_at).toLocaleDateString("fr-FR")}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}