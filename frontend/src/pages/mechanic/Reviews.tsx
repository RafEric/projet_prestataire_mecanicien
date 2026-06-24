import { useEffect, useState } from "react";
import { reviewsApi } from "../../api/reviews";
import { useAuth } from "../../contexts/AuthContext";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import type { Review } from "../../types/review";

export default function MechanicReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    reviewsApi.list({ mechanic: user.id })
      .then((d) => setReviews(d.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div>
      <PageHeader title="Avis reçus" subtitle={`Note moyenne : ${avg}/5`} />
      {loading ? <p>Chargement...</p> : reviews.length === 0 ? (
        <EmptyState title="Aucun avis" description="Les avis de vos clients apparaîtront ici." />
      ) : (
        <div className="cards-grid">
          {reviews.map((r) => (
            <div key={r.id} className="info-card">
              <div className="review-stars">{"⭐".repeat(r.rating)}</div>
              <h3>{r.service_request_title}</h3>
              <p>{r.comment || "Pas de commentaire"}</p>
              <small>{r.client.first_name} {r.client.last_name} — {new Date(r.created_at).toLocaleDateString("fr-FR")}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}