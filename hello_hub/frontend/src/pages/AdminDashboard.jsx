import api from "../api/axiosClient";
import DashboardLayout from "./DashboardLayout";

export default function AdminDashboard() {
  const loadUsers = async () => {
    const res = await api.get("/api/admin/users");
    alert(`Total users: ${res.data.length}`);
  };

  return (
    <DashboardLayout
      title="System Administration"
      subtitle="Manage campus users, roles, and operational visibility."
    >
      <div className="panel-grid">
        <article className="glass-card">
          <h3>Manage users</h3>
          <p>Fetch current user registry from the backend.</p>
          <button className="cta-btn" onClick={loadUsers}>
            Load Users
          </button>
        </article>
      </div>
    </DashboardLayout>
  );
}
