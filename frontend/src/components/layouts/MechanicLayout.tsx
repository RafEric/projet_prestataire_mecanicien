import { MECHANIC_NAV } from "../../config/navigation";
import DashboardLayout from "./DashboardLayout";

export default function MechanicLayout() {
  return <DashboardLayout navItems={MECHANIC_NAV} roleLabel="Espace Mécanicien" navbarTitle="Espace Mécanicien" />;
}