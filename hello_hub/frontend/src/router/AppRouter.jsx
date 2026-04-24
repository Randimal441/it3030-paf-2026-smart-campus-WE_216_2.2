import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import RoleSelectionPage from "../pages/RoleSelectionPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import Userbookings from "../pages/Userbookings";
import UserHome from "../pages/UserHome";
import UserLayout from "../pages/UserLayout";
import AdminLayout from "../pages/AdminLayout";
import UserNotifications from "../pages/UserNotifications";
import UserResources from "../pages/UserResources";
import UserTickets from "../pages/UserTickets";
import AdminBookings from "../pages/AdminBookings";
import AdminResources from "../pages/AdminResources";
import AdminTicket from "../pages/AdminTicket";
import AdminNotification from "../pages/AdminNotification";
import AdminApprovals from "../pages/AdminApprovals";
import TechnicianLayout from "../pages/TechnianLayout";
import TechnicianNavbar from "../components/TechnicianNavbar";
import TechnianTickets from "../pages/TechnianTickets";
import TechnianNotification from "../pages/TechnianNotification";

function RootRedirect() {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/select-role" replace />;
  }

  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="resources" element={<AdminResources />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="tickets" element={<AdminTicket />} />
        <Route path="notifications" element={<AdminNotification />} />
        <Route path="approvals" element={<AdminApprovals />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT", "LECTURER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserHome />} />
        <Route path="resources" element={<UserResources />} />
        <Route path="bookings" element={<Userbookings />} />
        <Route path="tickets" element={<UserTickets />} />
        <Route path="notifications" element={<UserNotifications />} />
      </Route>

      <Route
        path="/lecturer"
        element={
          <ProtectedRoute allowedRoles={["STUDENT", "LECTURER"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserHome />} />
        <Route path="resources" element={<UserResources />} />
        <Route path="bookings" element={<Userbookings />} />
        <Route path="tickets" element={<UserTickets />} />
        <Route path="notifications" element={<UserNotifications />} />
      </Route>

      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
            <TechnicianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TechnianTickets />} />
        <Route path="tickets" element={<TechnianTickets />} />
        <Route path="resources" element={<UserResources />} />
        <Route path="notifications" element={<TechnianNotification />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
