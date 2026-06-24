import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { reviewsApi } from "../../api/reviews";
import { serviceRequestsApi } from "../../api/serviceRequests";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { useToast } from "../../contexts/ToastContext";
import { useServiceRequestSocket } from "../../hooks/useServiceRequestSocket";
import type { ServiceRequestDetail } from "../../types/serviceRequest";

export default function ClientRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    serviceRequestsApi.get(parseInt(id)).then(setRequest).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = useCallback((updated: ServiceRequestDetail) => {
    setRequest(updated);
    showToast(`Statut mis à jour : ${updated.status}`, "info");
  }, [showToast]);

  useServiceRequestSocket({
    requestId: request?.id ?? null,
    onStatusUpdate: handleStatusUpdate,
  });

  const submitReview = async () => {
    if (!request) return;
    await reviewsApi.create({ service_request: request.id, rating, comment });
    const updated = await serviceRequestsApi.get(request.id);
    setRequest(updated);
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <p>Demande introuvable.</p>;

  return (
    <div>
      <PageHeader title={request.title} subtitle={`Créée le ${new Date(request.created_at).toLocaleDateString("fr-FR")}`} action={<Link to={`/client/chat?request=${request.id}`} className="btn-primary btn-sm">Ouvrir le chat</Link>} />
      <div className="detail-grid">
        <div className="card">
          <div className="detail-badges">
            <StatusBadge status={request.status} />
            <StatusBadge status={request.priority} type="priority" />
          </div>
          <p>{request.description}</p>
          <ul className="detail-list">
            <li><strong>Véhicule :</strong> {request.vehicle_brand} {request.vehicle_model} {request.vehicle_year}</li>
            <li><strong>Immatriculation :</strong> {request.license_plate || "—"}</li>
            <li><strong>Adresse :</strong> {request.address}, {request.city}</li>
            <li><strong>Mécanicien :</strong> {request.mechanic ? `${request.mechanic.first_name} ${request.mechanic.last_name}` : "Non assigné"}</li>
          </ul>
        </div>
        {request.status === "completed" && !request.has_review && (
          <div className="card">
            <h3>Laisser un avis</h3>
            <div className="form-group">
              <label>Note</label>
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoiles</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Commentaire</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
            </div>
            <button type="button" className="btn-primary btn-sm" onClick={submitReview}>Envoyer l&apos;avis</button>
          </div>
        )}
      </div>
    </div>
  );
}