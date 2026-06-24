import { CLIENT_NAV } from "../../config/navigation";
import DashboardLayout from "./DashboardLayout";

export default function ClientLayout() {
  return <DashboardLayout navItems={CLIENT_NAV} roleLabel="Espace Client" navbarTitle="Espace Client" />;
}