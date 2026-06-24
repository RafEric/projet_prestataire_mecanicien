import { NavLink } from "react-router-dom";
import type { NavItem } from "../../config/navigation";

interface SidebarProps {
  items: NavItem[];
  roleLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ items, roleLabel, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-overlay${isOpen ? " visible" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar${isOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">🔧</span>
          <div>
            <strong>Prestataire</strong>
            <small>{roleLabel}</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split("/").length <= 2}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}