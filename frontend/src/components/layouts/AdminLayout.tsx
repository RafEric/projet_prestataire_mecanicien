import { ADMIN_NAV } from "../../config/navigation";
import DashboardLayout from "./DashboardLayout";

export default function AdminLayout() {
  return <DashboardLayout navItems={ADMIN_NAV} roleLabel="Administration" navbarTitle="Espace Admin" />;
}