import React from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";

export default function AdminDashboard() {
  const loadUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      alert(`Total users: ${res.data.length}`);
    } catch (err) {
      alert("Error loading users from backend.");
    }
  };

  const adminStats = [
    { name: "Active Bookings", value: "24", icon: "📅", link: "/admin/bookings" },
    { name: "Fault Reports", value: "8", icon: "🎫", link: "/admin/tickets" },
    { name: "System Notifications", value: "12", icon: "🔔", link: "/admin/notifications" },
    { name: "Resource Catalogue", value: "45", icon: "🏢", link: "/admin/resources" },
  ];

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <p className="kicker">Admin Operations Hub</p>
            <h1>Operational Dashboard</h1>
            <p>Monitor your facilities, manage role-based access, and oversee the audit trail.</p>
          </div>
          <button className="cta-btn secondary" onClick={loadUsers}>
            👥 User Management
          </button>
        </div>

        <div className="role-grid" style={{ marginBottom: "24px" }}>
          {adminStats.map((stat, i) => (
            <Link to={stat.link} key={i} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{ height: "100%", padding: "20px" }}>
                <p style={{ margin: "0", fontSize: "14px", color: "var(--muted)", fontWeight: "600" }}>{stat.name}</p>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--ink)" }}>{stat.value}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "30px" }}>
            <h2>Campus Facilities Monitoring</h2>
            <p style={{ fontSize: "14px" }}>Review and update the catalogue of rooms, labs, and equipment for all users.</p>
            <div style={{ marginTop: "24px", padding: "12px", background: "#f8fbff", borderRadius: "10px", border: "1px solid var(--outline)" }}>
              <p style={{ margin: "0", fontSize: "13px", color: "var(--muted)" }}>Latest resource update: <strong>Lab 204 added 4h ago</strong></p>
            </div>
          </div>
          <div className="glass-card" style={{ padding: "30px" }}>
            <h2>Maintenance Overlook</h2>
            <p style={{ fontSize: "14px" }}>Supervise technician assignments and fault resolutions to ensure operational continuity.</p>
            <div style={{ marginTop: "24px", padding: "12px", background: "#f8fbff", borderRadius: "10px", border: "1px solid var(--outline)" }}>
              <p style={{ margin: "0", fontSize: "13px", color: "var(--muted)" }}>Urgent Fault: <strong>Network Issue in Main Hall</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
