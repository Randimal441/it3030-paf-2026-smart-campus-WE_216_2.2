import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="kicker">{user?.role || "USER"} Dashboard</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="cta-btn secondary" onClick={onLogout}>
            Sign Out
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
