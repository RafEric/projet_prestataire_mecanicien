import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_LABELS } from "../../utils/roles";
import NotificationBell from "../common/NotificationBell";

interface NavbarProps {
  title?: string;
  onMenuToggle: () => void;
}

export default function Navbar({ title, onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <button type="button" className="hamburger-btn" onClick={onMenuToggle} aria-label="Menu">
          <span /><span /><span />
        </button>
        {title && <h2>{title}</h2>}
      </div>
      <div className="navbar-right">
        <NotificationBell />
        <span className="navbar-user hide-mobile">
          {user?.first_name} {user?.last_name}
          <small>{user ? ROLE_LABELS[user.role] : ""}</small>
        </span>
        <Link to="/" className="btn-ghost btn-sm hide-mobile">
          Accueil
        </Link>
        <button type="button" onClick={logout} className="btn-secondary btn-sm">
          Déconnexion
        </button>
      </div>
    </header>
  );
}