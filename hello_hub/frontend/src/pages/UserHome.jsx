import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserHome() {
  const { user } = useAuth();

  const services = [
    {
      title: "Facilities & Labs",
      desc: "Browse our modernized catalogue of rooms, labs, and specialized equipment.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v17" />
        </svg>
      ),
      link: "/student/resources",
    },
    {
      title: "Booking Workflow",
      desc: "Request resources and track your booking status through the approval process.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      link: "/student/bookings",
    },
    {
      title: "Incident Tickets",
      desc: "Report faults or hardware issues and get updates from our technical team.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <line x1="13" y1="5" x2="13" y2="19" />
        </svg>
      ),
      link: "/student/tickets",
    },
    {
      title: "Notifications",
      desc: "Stay updated on your booking approvals and ticket resolutions.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      link: "/student/notifications",
    },
  ];

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <p className="kicker">Smart Campus Operations Hub</p>
            <h1 style={{ fontSize: "3rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
              Welcome back, <span style={{ color: "var(--accent)" }}>{user?.name || "Member"}</span>
            </h1>
            <p style={{ fontSize: "1.1rem", maxWidth: "500px" }}>
              Your central portal for university facilities management, equipment booking, and maintenance handling.
            </p>
            <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
              <Link to="/student/resources" className="cta-btn" style={{ textDecoration: "none" }}>Get Started</Link>
              <Link to="/student/bookings" className="cta-btn secondary" style={{ textDecoration: "none" }}>View My Bookings</Link>
            </div>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <div className="glass-card" style={{ padding: "0", background: "transparent", border: "none", boxShadow: "none", overflow: "visible" }}>
              {/* Abstract decorative graphic instead of an image */}
              <div style={{ width: "400px", height: "400px", background: "linear-gradient(135deg, var(--accent), #2f61b9)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", opacity: "0.1", position: "absolute", top: "0", right: "0", filter: "blur(40px)" }}></div>
              <div style={{ position: "relative", zIndex: 1, padding: "30px", background: "var(--glass)", border: "1px solid var(--outline)", borderRadius: "24px", backdropFilter: "blur(12px)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid var(--outline)" }}>
                    <div style={{ color: "var(--accent)", marginBottom: "8px" }}>● Active</div>
                    <div style={{ fontSize: "24px", fontWeight: "700" }}>1,240</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Monthly Bookings</div>
                  </div>
                  <div style={{ background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid var(--outline)" }}>
                    <div style={{ color: "#2f61b9", marginBottom: "8px" }}>● Resolved</div>
                    <div style={{ fontSize: "24px", fontWeight: "700" }}>98%</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Incident Repairs</div>
                  </div>
                  <div style={{ gridColumn: "span 2", background: "#f8fbff", padding: "16px", borderRadius: "16px", border: "1px solid var(--outline)" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Recent Activity</div>
                    <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Room 302 Booking</span>
                      <span style={{ color: "var(--accent)" }}>+2m ago</span>
                    </div>
                    <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                      <span>Projector Fault #402</span>
                      <span style={{ color: "#2f61b9" }}>Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="role-grid" style={{ marginTop: "60px" }}>
          {services.map((service, index) => (
            <Link to={service.link} key={index} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{ height: "100%", transition: "all 0.3s ease", cursor: "pointer" }} 
                   onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                   onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ width: "48px", height: "48px", background: "#eef3fb", borderRadius: "12px", display: "grid", placeItems: "center", marginBottom: "20px", color: "var(--accent)" }}>
                  {service.icon}
                </div>
                <h3 style={{ color: "var(--ink)", marginBottom: "12px" }}>{service.title}</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--muted)" }}>{service.desc}</p>
                <div style={{ marginTop: "20px", color: "var(--accent)", fontWeight: "700", fontSize: "14px" }}>
                  Launch Service →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
