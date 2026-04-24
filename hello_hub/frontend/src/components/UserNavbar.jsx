import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function UserNavbar({ activeMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const roleRoot = user?.role?.toLowerCase() === "lecturer" ? "/lecturer" : "/student";
  const lastPathSegment = location.pathname.split("/").filter(Boolean).pop();
  const resolvedActiveMenu = activeMenu || (lastPathSegment === "resources" || lastPathSegment === "bookings" || lastPathSegment === "tickets" || lastPathSegment === "notifications" ? lastPathSegment : "home");

  const navLinkClass = (menuKey) =>
    `user-nav-link${resolvedActiveMenu === menuKey ? " active" : ""}`;

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const goTo = (path = "") => {
    navigate(`${roleRoot}${path}`);
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

      <div className="user-nav-links" role="navigation" aria-label="User sections">
        <button type="button" className={navLinkClass("home")} onClick={() => goTo()}>
          Home
        </button>
        <button type="button" className={navLinkClass("resources")} onClick={() => goTo("/resources")}>
          Resources
        </button>
        <button type="button" className={navLinkClass("bookings")} onClick={() => goTo("/bookings")}>
          Bookings
        </button>
        <button type="button" className={navLinkClass("tickets")} onClick={() => goTo("/tickets")}>
          Tickets
        </button>
      </div>

      <div className="user-nav-actions" aria-label="Quick actions">
        <NotificationBell
          active={resolvedActiveMenu === "notifications"}
          notificationsPath={`${roleRoot}/notifications`}
        />
        <div className="profile-menu">
          <button
            type="button"
            className="icon-btn"
            aria-label="Profile"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
            </svg>
          </button>
          {showProfile ? (
            <div className="profile-card">
              <p className="profile-name">{user?.name || "User"}</p>
              <p className="profile-email">{user?.email || "No email"}</p>
              <div className="profile-meta">
                <span>Role: {user?.role || "Pending"}</span>
                <span>Provider: {user?.provider || "LOCAL"}</span>
              </div>
            </div>
          ) : null}
        </div>
        <button type="button" className="cta-btn secondary" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
