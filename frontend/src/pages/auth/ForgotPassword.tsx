import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useToast } from "../../contexts/ToastContext";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await authApi.requestPasswordReset(email);
      setSent(true);
      if (result.reset_url) setResetUrl(result.reset_url);
      showToast(result.message, "success");
    } catch {
      showToast("Erreur lors de l'envoi de l'email.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-card">
        <h2>Email envoyé</h2>
        <p className="success-message">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
        </p>
        {resetUrl && (
          <p className="dev-hint">
            Mode dev : <a href={resetUrl}>Ouvrir le lien de réinitialisation</a>
          </p>
        )}
        <Link to="/login" className="btn-primary btn-block">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Mot de passe oublié</h2>
      <p className="auth-description">Entrez votre email pour recevoir un lien de réinitialisation.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
      <p className="auth-link">
        <Link to="/login">Retour à la connexion</Link>
      </p>
    </div>
  );
}