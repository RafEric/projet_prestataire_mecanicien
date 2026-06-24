import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardPath } from "../utils/roles";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Prestataire de Service Mécanicien</h1>
        <p className="hero-subtitle">
          Trouvez un mécanicien qualifié près de chez vous, créez une demande d&apos;intervention et suivez-la en temps réel.
        </p>
        <div className="hero-actions">
          {isAuthenticated && user ? (
            <Link to={getDashboardPath(user.role)} className="btn-primary">
              Accéder à mon espace
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">
                Créer un compte
              </Link>
              <Link to="/login" className="btn-secondary">
                Se connecter
              </Link>
            </>
          )}
        </div>
        <div className="hero-features">
          <div className="feature-card">
            <span>🔍</span>
            <h3>Recherche géolocalisée</h3>
            <p>Trouvez les mécaniciens les plus proches</p>
          </div>
          <div className="feature-card">
            <span>📋</span>
            <h3>Suivi des demandes</h3>
            <p>De la création à la finalisation</p>
          </div>
          <div className="feature-card">
            <span>💬</span>
            <h3>Messagerie intégrée</h3>
            <p>Échangez directement avec votre mécanicien</p>
          </div>
        </div>
      </div>
    </section>
  );
}