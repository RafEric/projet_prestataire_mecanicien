import { useState, type FormEvent } from "react";
import { usersApi } from "../../api/users";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/common/PageHeader";

export default function ClientProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: user?.phone ?? "",
    username: user?.username ?? "",
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await usersApi.updateMe(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles" />
      <form onSubmit={handleSubmit} className="card form-card">
        {saved && <p className="success-message">Profil mis à jour.</p>}
        <div className="form-row">
          <div className="form-group">
            <label>Prénom</label>
            <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={user?.email} disabled />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Nom d&apos;utilisateur</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </form>
    </div>
  );
}