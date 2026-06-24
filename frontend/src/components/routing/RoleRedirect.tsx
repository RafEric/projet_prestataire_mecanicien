import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardPath } from "../../utils/roles";
import LoadingSpinner from "../common/LoadingSpinner";

export default function RoleRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}