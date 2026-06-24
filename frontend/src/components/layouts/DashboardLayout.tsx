import { useState } from "react";
import { Outlet } from "react-router-dom";
import type { NavItem } from "../../config/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  navItems: NavItem[];
  roleLabel: string;
  navbarTitle?: string;
}

export default function DashboardLayout({ navItems, roleLabel, navbarTitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar
        items={navItems}
        roleLabel={roleLabel}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <Navbar title={navbarTitle} onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}