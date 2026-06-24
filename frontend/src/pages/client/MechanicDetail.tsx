import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mechanicsApi } from "../../api/mechanics";
import { reviewsApi } from "../../api/reviews";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageHeader from "../../components/common/PageHeader";
import type { MechanicProfile } from "../../types/mechanic";
import type { Review } from "../../types/review";

export default function MechanicDetail() {
  const { id } = useParams<{ id: string }>();
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
    load().catch(console.error);
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!mechanic) return <p>Mécanicien introuvable.</p>;

  return (
    <div>
      <PageHeader
        title={mechanic.business_name || mechanic.full_name}
        subtitle={`${mechanic.city} — ${mechanic.specialties || "Mécanicien généraliste"}`}
        action={<Link to="/client/requests/new" className="btn-primary btn-sm">Créer une demande</Link>}
      />
      <div className="detail-grid">
        <div className="card">
          <h3>Informations</h3>
          <ul className="detail-list">
            <li><strong>Expérience :</strong> {mechanic.years_experience} ans</li>
            <li><strong>Tarif horaire :</strong> {mechanic.hourly_rate ? `${mechanic.hourly_rate} €` : "Non renseigné"}</li>
            <li><strong>Note :</strong> ⭐ {mechanic.average_rating} ({mechanic.total_reviews} avis)</li>
            <li><strong>Disponibilité :</strong> {mechanic.is_available ? "Disponible" : "Indisponible"}</li>
            <li><strong>Vérifié :</strong> {mechanic.is_verified ? "Oui" : "Non"}</li>
            <li><strong>Adresse :</strong> {mechanic.address}, {mechanic.postal_code} {mechanic.city}</li>
          </ul>
          {mechanic.bio && <p className="bio-text">{mechanic.bio}</p>}
        </div>
        <div className="card">
          <h3>Avis clients ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-muted">Aucun avis pour le moment.</p>
          ) : (
            reviews.map((r) => (
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
  );
}