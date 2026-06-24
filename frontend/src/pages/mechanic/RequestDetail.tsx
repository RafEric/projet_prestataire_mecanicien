import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { messagesApi } from "../../api/messages";
import { serviceRequestsApi } from "../../api/serviceRequests";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useServiceRequestSocket } from "../../hooks/useServiceRequestSocket";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import type { Message } from "../../types/message";
import type { ServiceRequestDetail } from "../../types/serviceRequest";

export default function MechanicRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    const r = await serviceRequestsApi.get(parseInt(id));
    setRequest(r);
    if (r.mechanic) {
      const msgs = await messagesApi.getForRequest(r.id);
      setMessages(msgs);
    }
    setLoading(false);
  };

  useEffect(() => { load().catch(console.error); }, [id]);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  const handleStatusUpdate = useCallback((updated: ServiceRequestDetail) => {
    setRequest(updated);
    showToast(`Statut mis à jour : ${updated.status}`, "info");
  }, [showToast]);

  useServiceRequestSocket({
    requestId: request?.id ?? null,
    onMessage: appendMessage,
    onStatusUpdate: handleStatusUpdate,
  });

  const accept = async () => {
    if (!request) return;
    await serviceRequestsApi.assign(request.id);
    load();
  };

  const updateStatus = async (status: string) => {
    if (!request) return;
    const payload: Record<string, unknown> = { status };
    if (status === "completed" && finalPrice) payload.final_price = parseFloat(finalPrice);
    await serviceRequestsApi.update(request.id, payload);
    load();
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!request || !content.trim()) return;
    const msg = await messagesApi.send(request.id, content.trim());
    appendMessage(msg);
    setContent("");
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <p>Demande introuvable.</p>;

  return (
    <div>
      <PageHeader title={request.title} subtitle={`Client : ${request.client.first_name} ${request.client.last_name}`} />
      <div className="detail-grid">
        <div className="card">
          <div className="detail-badges">
            <StatusBadge status={request.status} />
            <StatusBadge status={request.priority} type="priority" />
          </div>
          <p>{request.description}</p>
          <ul className="detail-list">
            <li><strong>Véhicule :</strong> {request.vehicle_brand} {request.vehicle_model}</li>
            <li><strong>Adresse :</strong> {request.address}, {request.city}</li>
            <li><strong>Téléphone client :</strong> {request.client.phone || "—"}</li>
          </ul>
          <div className="card-actions">
            {request.status === "pending" && !request.mechanic && (
              <button type="button" className="btn-primary btn-sm" onClick={accept}>Accepter la demande</button>
            )}
            {request.status === "accepted" && (
              <button type="button" className="btn-primary btn-sm" onClick={() => updateStatus("in_progress")}>Démarrer</button>
            )}
            {request.status === "in_progress" && (
              <>
                <div className="form-group">
                  <label>Prix final (€)</label>
                  <input type="number" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} />
                </div>
                <button type="button" className="btn-primary btn-sm" onClick={() => updateStatus("completed")}>Terminer</button>
              </>
            )}
            <button type="button" className="btn-ghost btn-sm" onClick={() => navigate("/mechanic/requests")}>Retour</button>
          </div>
        </div>
        {request.mechanic && (
          <div className="card chat-panel">
            <h3>Messages</h3>
            <div className="chat-messages compact">
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble${m.sender.id === user?.id ? " mine" : ""}`}>
                  <strong>{m.sender.first_name}</strong>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="chat-input">
              <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Répondre..." />
              <button type="submit" className="btn-primary btn-sm">Envoyer</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}