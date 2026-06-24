import { useEffect, useState, type FormEvent } from "react";
import { mechanicsApi } from "../../api/mechanics";
import PageHeader from "../../components/common/PageHeader";
import type { MechanicProfile } from "../../types/mechanic";

export default function MechanicProfilePage() {
  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    bio: "",
    specialties: "",
    address: "",
    city: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    hourly_rate: "",
    years_experience: "0",
    is_available: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    mechanicsApi.getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          business_name: p.business_name,
          bio: p.bio,
          specialties: p.specialties,
          address: p.address,
          city: p.city,
          postal_code: p.postal_code,
          latitude: p.latitude ?? "",
          longitude: p.longitude ?? "",
          hourly_rate: p.hourly_rate ?? "",
          years_experience: String(p.years_experience),
          is_available: p.is_available,
        });
      })
      .catch(() => setIsNew(true));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      business_name: form.business_name,
      bio: form.bio,
      specialties: form.specialties,
      address: form.address,
      city: form.city,
      postal_code: form.postal_code,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : undefined,
      years_experience: parseInt(form.years_experience),
      is_available: form.is_available,
    };

    if (isNew || !profile) {
      const created = await mechanicsApi.create(payload);
      setProfile(created);
      setIsNew(false);
    } else {
      const updated = await mechanicsApi.update(profile.id, payload);
      setProfile(updated);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    });
  };

  return (
    <div>
      <PageHeader title="Profil mécanicien" subtitle="Votre vitrine professionnelle" />
      <form onSubmit={handleSubmit} className="card form-card">
        {saved && <p className="success-message">Profil enregistré.</p>}
        <div className="form-group">
          <label>Nom de l&apos;entreprise</label>
          <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
        </div>
        <div className="form-group">
          <label>Spécialités</label>
          <input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="freinage, moteur, climatisation" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Adresse</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Code postal</label>
            <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
          <div className="form-group form-group-btn">
            <label>&nbsp;</label>
            <button type="button" className="btn-secondary btn-sm" onClick={useMyLocation}>📍 GPS</button>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tarif horaire (€)</label>
            <input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Années d&apos;expérience</label>
            <input type="number" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn-primary">{isNew ? "Créer le profil" : "Enregistrer"}</button>
      </form>
    </div>
  );
}