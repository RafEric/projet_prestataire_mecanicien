import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./components/layouts/AuthLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import ClientLayout from "./components/layouts/ClientLayout";
import MechanicLayout from "./components/layouts/MechanicLayout";
import PublicLayout from "./components/layouts/PublicLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import RoleRedirect from "./components/routing/RoleRedirect";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";

import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/Home";
import PublicMechanicDetail from "./pages/PublicMechanicDetail";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminMechanics from "./pages/admin/Mechanics";
import MechanicValidation from "./pages/admin/MechanicValidation";
import AdminServiceRequests from "./pages/admin/ServiceRequests";
import AdminStatistics from "./pages/admin/Statistics";
import AdminUsers from "./pages/admin/Users";

import ClientChat from "./pages/client/Chat";
import ClientCreateRequest from "./pages/client/CreateRequest";
import ClientDashboard from "./pages/client/Dashboard";
import MechanicDetail from "./pages/client/MechanicDetail";
import MechanicMap from "./pages/client/MechanicMap";
import MechanicSearch from "./pages/client/MechanicSearch";
import ClientProfile from "./pages/client/Profile";
import ClientRequestDetail from "./pages/client/RequestDetail";
import RequestHistory from "./pages/client/RequestHistory";

import MechanicAvailability from "./pages/mechanic/Availability";
import MechanicDashboard from "./pages/mechanic/Dashboard";
import MechanicProfilePage from "./pages/mechanic/Profile";
import MechanicRequestDetail from "./pages/mechanic/RequestDetail";
import MechanicRequestHistory from "./pages/mechanic/RequestHistory";
import MechanicRequestsList from "./pages/mechanic/RequestsList";
import MechanicReviews from "./pages/mechanic/Reviews";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="mechanics/:id" element={<PublicMechanicDetail />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="dashboard" element={<RoleRedirect />} />

          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="mechanics" element={<AdminMechanics />} />
            <Route path="validation" element={<MechanicValidation />} />
            <Route path="requests" element={<AdminServiceRequests />} />
            <Route path="statistics" element={<AdminStatistics />} />
          </Route>

          <Route
            path="client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="search" element={<MechanicSearch />} />
            <Route path="map" element={<MechanicMap />} />
            <Route path="mechanics/:id" element={<MechanicDetail />} />
            <Route path="requests" element={<RequestHistory />} />
            <Route path="requests/new" element={<ClientCreateRequest />} />
            <Route path="requests/:id" element={<ClientRequestDetail />} />
            <Route path="chat" element={<ClientChat />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          <Route
            path="mechanic"
            element={
              <ProtectedRoute allowedRoles={["mecanicien"]}>
                <MechanicLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MechanicDashboard />} />
            <Route path="requests" element={<MechanicRequestsList />} />
            <Route path="requests/:id" element={<MechanicRequestDetail />} />
            <Route path="history" element={<MechanicRequestHistory />} />
            <Route path="availability" element={<MechanicAvailability />} />
            <Route path="profile" element={<MechanicProfilePage />} />
            <Route path="reviews" element={<MechanicReviews />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </WebSocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;