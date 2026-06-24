import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { serviceRequestsApi } from "../../api/serviceRequests";
import PageHeader from "../../components/common/PageHeader";
import type { ServiceRequestPriority } from "../../types/serviceRequest";

export default function CreateRequest() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_year: "",
    license_plate: "",
    priority: "medium" as ServiceRequestPriority,
    address: "",
    city: "",
    postal_code: "",
    scheduled_at: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const created = await serviceRequestsApi.create({
        ...form,
        vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year) : undefined,
        scheduled_at: form.scheduled_at || undefined,
      });
      navigate(`/client/requests/${created.id}`);
    } catch {
      setError("Erreur lors de la création de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Nouvelle demande" subtitle="Décrivez votre besoin d'intervention" />
      <form onSubmit={handleSubmit} className="card form-card">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Titre *</label>
          <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Marque</label>
            <input value={form.vehicle_brand} onChange={(e) => handleChange("vehicle_brand", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Modèle</label>
            <input value={form.vehicle_model} onChange={(e) => handleChange("vehicle_model", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Année</label>
            <input type="number" value={form.vehicle_year} onChange={(e) => handleChange("vehicle_year", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Immatriculation</label>
            <input value={form.license_plate} onChange={(e) => handleChange("license_plate", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Priorité</label>
            <select value={form.priority} onChange={(e) => handleChange("priority", e.target.value)}>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Adresse</label>
            <input value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Code postal</label>
            <input value={form.postal_code} onChange={(e) => handleChange("postal_code", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Date souhaitée</label>
          <input type="datetime-local" value={form.scheduled_at} onChange={(e) => handleChange("scheduled_at", e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer la demande"}
        </button>
      </form>
    </div>
  );
}