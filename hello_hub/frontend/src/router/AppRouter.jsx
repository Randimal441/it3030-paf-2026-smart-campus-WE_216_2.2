import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import LecturerDashboard from "../pages/LecturerDashboard";
import LoginPage from "../pages/LoginPage";
import RoleSelectionPage from "../pages/RoleSelectionPage";
import StudentDashboard from "../pages/StudentDashboard";
import TechnicianDashboard from "../pages/TechnicianDashboard";
import UnauthorizedPage from "../pages/UnauthorizedPage";

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
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturer"
        element={
          <ProtectedRoute allowedRoles={["LECTURER"]}>
            <LecturerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
