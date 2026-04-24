import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyBookings } from "../api/bookingService";
import { getAllResources } from "../api/resourceService";
import { getMyNotifications, getUnreadNotificationCount } from "../api/notificationService";
import api from "../api/axiosClient";

export default function UserHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeBookings: 0, resolvedTickets: 0 });
  const [activities, setActivities] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [ticketSummary, setTicketSummary] = useState({ open: 0, progress: 0, resolved: 0 });
  const [resourceRecommendations, setResourceRecommendations] = useState([]);
  const [notificationsPreview, setNotificationsPreview] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const toDateTimeValue = (booking) => {
    if (!booking?.bookingDate) {
      return null;
    }

    const datePart = String(booking.bookingDate).slice(0, 10);
    const timePart = booking?.startTime ? String(booking.startTime).slice(0, 5) : "00:00";
    const timestamp = new Date(`${datePart}T${timePart}:00`).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  const normalizeTicketStatus = (status = "") => {
    const normalized = status.toString().replace(/_/g, " ").trim().toLowerCase();
    if (!normalized) {
      return "open";
    }
    if (normalized === "assigned" || normalized === "in progress") {
      return "in progress";
    }
    if (normalized === "resolved") {
      return "resolved";
    }
    if (normalized === "closed") {
      return "resolved";
    }
    if (normalized === "rejected" || normalized === "reject") {
      return "resolved";
    }
    return normalized;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, ticketsRes, resourcesRes, notificationsRes, unreadRes] = await Promise.all([
          getMyBookings(),
          api.get("/api/tickets/my-tickets"),
          getAllResources(),
          getMyNotifications(),
          getUnreadNotificationCount()
        ]);

        const myBookings = bookingsRes.data || [];
        const myTickets = ticketsRes.data || [];
        const resources = resourcesRes.data || [];
        const notifications = notificationsRes.data || [];

        const activeBookings = myBookings.filter(b => b.status === "PENDING" || b.status === "APPROVED").length;
        const resolvedTickets = myTickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length;

        setStats({ activeBookings, resolvedTickets });

        const recentActivities = [];
        if (myBookings.length > 0) {
          recentActivities.push({
            title: `${myBookings[0].resourceName} Booking`,
            status: myBookings[0].status,
            color: "var(--accent)"
          });
        }
        if (myTickets.length > 0) {
          recentActivities.push({
            title: myTickets[0].title,
            status: myTickets[0].status,
            color: "#2f61b9"
          });
        }
        setActivities(recentActivities.slice(0, 2));

        const upcoming = myBookings
          .map((booking) => ({
            ...booking,
            sortValue: toDateTimeValue(booking)
          }))
          .filter((booking) => booking.sortValue !== null)
          .sort((a, b) => a.sortValue - b.sortValue)
          .slice(0, 3);
        setUpcomingBookings(upcoming);

        const summary = myTickets.reduce(
          (acc, ticket) => {
            const status = normalizeTicketStatus(ticket?.status || "open");
            if (status === "open") {
              acc.open += 1;
            } else if (status === "in progress") {
              acc.progress += 1;
            } else {
              acc.resolved += 1;
            }
            return acc;
          },
          { open: 0, progress: 0, resolved: 0 }
        );
        setTicketSummary(summary);

        const recommendations = resources
          .filter((resource) => resource?.status === "ACTIVE" || resource?.status === "AVAILABLE")
          .sort((a, b) => (b?.capacity || 0) - (a?.capacity || 0))
          .slice(0, 3);
        setResourceRecommendations(recommendations);

        const sortedNotifications = notifications
          .slice()
          .sort((a, b) => {
            const aTime = new Date(a?.createdAt || 0).getTime();
            const bTime = new Date(b?.createdAt || 0).getTime();
            return bTime - aTime;
          })
          .slice(0, 3);
        setNotificationsPreview(sortedNotifications);

        setUnreadNotifications(Number(unreadRes?.data?.unreadCount || 0));

      } catch (err) {
        console.error("Error fetching home stats:", err);
      }
    };
    fetchData();
  }, []);

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
      <div className="dashboard-shell" style={{ width: "min(1320px, 100%)" }}>
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
                    <div style={{ fontSize: "24px", fontWeight: "700" }}>{stats.activeBookings}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Active Bookings</div>
                  </div>
                  <div style={{ background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid var(--outline)" }}>
                    <div style={{ color: "#2f61b9", marginBottom: "8px" }}>● Resolved</div>
                    <div style={{ fontSize: "24px", fontWeight: "700" }}>{stats.resolvedTickets}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Resolved Repairs</div>
                  </div>
                  <div style={{ gridColumn: "span 2", background: "#f8fbff", padding: "16px", borderRadius: "16px", border: "1px solid var(--outline)" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Recent Activity</div>
                    {activities.length > 0 ? activities.map((act, idx) => (
                      <div key={idx} style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", marginBottom: idx === 0 ? "4px" : "0" }}>
                        <span>{act.title}</span>
                        <span style={{ color: act.color }}>{act.status}</span>
                      </div>
                    )) : (
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>No recent activity to show.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="home-grid">
          <div className="glass-card home-card">
            <div className="home-card-header">
              <h3>Upcoming Bookings</h3>
              <Link to="/student/bookings" className="home-card-link">View all</Link>
            </div>
            {upcomingBookings.length > 0 ? (
              <div className="home-list">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="home-list-row">
                    <div>
                      <p className="home-list-title">{booking.resourceName || "Resource"}</p>
                      <p className="home-list-subtitle">
                        {booking.bookingDate} · {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                      </p>
                    </div>
                    <span className="home-pill">{booking.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="home-empty">No upcoming bookings.</p>
            )}
          </div>

          <div className="glass-card home-card">
            <div className="home-card-header">
              <h3>My Tickets</h3>
              <Link to="/student/tickets" className="home-card-link">Open tickets</Link>
            </div>
            <div className="ticket-summary-grid">
              <div className="ticket-summary-item">
                <span>Open</span>
                <strong>{ticketSummary.open}</strong>
              </div>
              <div className="ticket-summary-item">
                <span>In Progress</span>
                <strong>{ticketSummary.progress}</strong>
              </div>
              <div className="ticket-summary-item">
                <span>Resolved</span>
                <strong>{ticketSummary.resolved}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card home-card">
            <div className="home-card-header">
              <h3>Resource Picks</h3>
              <Link to="/student/resources" className="home-card-link">Browse</Link>
            </div>
            {resourceRecommendations.length > 0 ? (
              <div className="home-list">
                {resourceRecommendations.map((resource) => (
                  <div key={resource.id} className="home-list-row">
                    <div>
                      <p className="home-list-title">{resource.name || "Resource"}</p>
                      <p className="home-list-subtitle">
                        {resource.type || "Facility"} · Capacity {resource.capacity || "-"}
                      </p>
                    </div>
                    <span className="home-pill">{resource.status || "ACTIVE"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="home-empty">No resources available right now.</p>
            )}
          </div>

          <div className="glass-card home-card">
            <div className="home-card-header">
              <h3>Notifications</h3>
              <span className="home-badge">Unread {unreadNotifications}</span>
            </div>
            {notificationsPreview.length > 0 ? (
              <div className="home-list">
                {notificationsPreview.map((notification) => (
                  <div key={notification.id} className="home-list-row">
                    <div>
                      <p className="home-list-title">{notification.title || "Update"}</p>
                      <p className="home-list-subtitle">{notification.message || ""}</p>
                    </div>
                    <span className="home-pill">{notification.type || "INFO"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="home-empty">No notifications yet.</p>
            )}
          </div>
        </section>

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
