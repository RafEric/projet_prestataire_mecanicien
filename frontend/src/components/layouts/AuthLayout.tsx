import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout-panel">
        <Link to="/" className="auth-layout-brand">
          🔧 Prestataire Mécanicien
        </Link>
        <h1>Votre expert automobile à portée de main</h1>
        <p>Trouvez un mécanicien qualifié, suivez vos interventions et échangez en temps réel.</p>
      </div>
      <div className="auth-layout-form">
        <Outlet />
      </div>
    </div>
  );
}