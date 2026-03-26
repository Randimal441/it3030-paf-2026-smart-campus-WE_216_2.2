import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TechnicianNavbar({ activeMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const lastPathSegment = location.pathname.split("/").filter(Boolean).pop();
  const resolvedActiveMenu =
    activeMenu ||
    (
    lastPathSegment === "resources" ||
    lastPathSegment === "tickets" ||
    lastPathSegment === "notifications"
      ? lastPathSegment
      : "tickets");

  const navLinkClass = (menuKey) =>
    `user-nav-link${resolvedActiveMenu === menuKey ? " active" : ""}`;

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const goTo = (path = "") => {
    navigate(`/technician${path}`);
  };

  return (
    <nav className="user-nav glass-card">
      <div className="user-nav-brand">
        <div className="user-nav-brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M12 3l7 4v10l-7 4-7-4V7l7-4zm0 2.2L7 8v8l5 2.8 5-2.8V8l-5-2.8zm0 2.3a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
          </svg>
        </div>
        <span>UniSupport</span>
      </div>

      <div className="user-nav-links" role="navigation" aria-label="Technician sections">
        <button type="button" className={navLinkClass("tickets")} onClick={() => goTo("/tickets")}>
          Tickets
        </button>
        <button type="button" className={navLinkClass("resources")} onClick={() => goTo("/resources")}>
          Resources
        </button>

      </div>

      <div className="user-nav-actions" aria-label="Quick actions">
        <button type="button" className="icon-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M10.5 4a6.5 6.5 0 014.99 10.67l4.42 4.42-1.41 1.41-4.42-4.42A6.5 6.5 0 1110.5 4zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
          </svg>
        </button>
        <button
          type="button"
          className={`icon-btn${resolvedActiveMenu === "notifications" ? " active" : ""}`}
          aria-label="Notifications"
          onClick={() => goTo("/notifications")}
        >
          <svg viewBox="0 0 24 24" role="img">
            <path d="M12 3a5 5 0 00-5 5v2.18c0 .74-.2 1.46-.57 2.1L5 15v1h14v-1l-1.43-2.72a4.5 4.5 0 01-.57-2.1V8a5 5 0 00-5-5zm0 19a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22z" />
          </svg>
          <span className="icon-dot" aria-hidden="true"></span>
        </button>
        <button type="button" className="icon-btn" aria-label="Profile">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
        </button>
        <button type="button" className="cta-btn secondary" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
