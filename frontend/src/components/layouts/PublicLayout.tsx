import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardPath } from "../../utils/roles";

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="logo">
          Prestataire Mécanicien
        </Link>
        <nav>
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardPath(user.role)} className="btn-primary btn-sm">
                Mon espace
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register" className="btn-primary btn-sm">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="public-footer">
        <p>&copy; 2026 Prestataire de Service Mécanicien</p>
      </footer>
    </div>
  );
}