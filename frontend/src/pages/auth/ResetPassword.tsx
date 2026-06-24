import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useToast } from "../../contexts/ToastContext";

export default function ResetPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!uid || !token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset({
        uid,
        token,
        new_password: password,
        new_password_confirm: passwordConfirm,
      });
      showToast("Mot de passe réinitialisé avec succès.", "success");
      navigate("/login");
    } catch {
      setError("Le lien est invalide ou expiré. Demandez un nouveau lien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Nouveau mot de passe</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div className="form-group">
          <label htmlFor="password_confirm">Confirmer</label>
          <input id="password_confirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={8} />
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Réinitialiser"}
        </button>
      </form>
      <p className="auth-link">
        <Link to="/forgot-password">Demander un nouveau lien</Link>
      </p>
    </div>
  );
}