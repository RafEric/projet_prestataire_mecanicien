import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types/auth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    role: "client" as UserRole,
    phone: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate("/login");
    } catch {
      setError("Erreur lors de l'inscription. Vérifiez vos informations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card auth-card-wide">
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">Prénom</label>
            <input id="first_name" value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Nom</label>
            <input id="last_name" value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="username">Nom d&apos;utilisateur</label>
          <input id="username" value={formData.username} onChange={(e) => handleChange("username", e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="role">Type de compte</label>
          <select id="role" value={formData.role} onChange={(e) => handleChange("role", e.target.value)}>
            <option value="client">Client</option>
            <option value="mecanicien">Mécanicien</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="phone">Téléphone</label>
          <input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required minLength={8} />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirm">Confirmer</label>
            <input id="password_confirm" type="password" value={formData.password_confirm} onChange={(e) => handleChange("password_confirm", e.target.value)} required minLength={8} />
          </div>
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
      <p className="auth-link">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}