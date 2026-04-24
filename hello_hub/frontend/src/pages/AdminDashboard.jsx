import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getAllBookings } from "../api/bookingService";
import { getAllResources } from "../api/resourceService";
import api from "../api/axiosClient";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    activeBookings: 0,
    faultReports: 0,
    notifications: 0,
    resourceCount: 0
  });
  const [bookingTrend, setBookingTrend] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [ticketStatusData, setTicketStatusData] = useState([]);
  const [topResourcesData, setTopResourcesData] = useState([]);

  const chartPalette = ["#2f61d3", "#007f79", "#ffb020", "#e15858", "#7a5af8"];
  const statusPalette = {
    Pending: "#ffb020",
    Approved: "#1e7e34",
    Rejected: "#d93025",
    Cancelled: "#7a849a",
    Open: "#2f61d3",
    "In Progress": "#ffb020",
    Resolved: "#1e7e34",
    Closed: "#7a849a",
    RejectedTicket: "#d93025"
  };

  const toShortDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  const toDateKey = (dateValue) => {
    if (!dateValue) {
      return null;
    }
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().slice(0, 10);
  };

  const normalizeTicketStatus = (status = "") => {
    const normalized = status.toString().replace(/_/g, " ").trim().toLowerCase();
    if (!normalized) {
      return "Open";
    }
    if (normalized === "assigned" || normalized === "in progress") {
      return "In Progress";
    }
    if (normalized === "resolved") {
      return "Resolved";
    }
    if (normalized === "rejected" || normalized === "reject") {
      return "Rejected";
    }
    if (normalized === "closed" || normalized === "close") {
      return "Closed";
    }
    return normalized.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  };

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [bookingsRes, resourcesRes, ticketsRes, notificationsRes] = await Promise.all([
          getAllBookings(),
          getAllResources(),
          api.get("/api/tickets/admin"),
          api.get("/api/notifications/unread-count")
        ]);

        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data : [];

        setStatsData({
          activeBookings: bookings.filter(b => b.status === "PENDING" || b.status === "APPROVED").length,
          faultReports: tickets.length,
          notifications: Number(notificationsRes?.data?.unreadCount || 0),
          resourceCount: resources.length
        });

        const bookingStatusMap = bookings.reduce((acc, booking) => {
          const status = (booking?.status || "Pending").toString().toUpperCase();
          const label = status === "APPROVED"
            ? "Approved"
            : status === "REJECTED"
              ? "Rejected"
              : status === "CANCELLED"
                ? "Cancelled"
                : "Pending";
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {});

        setBookingStatusData(
          Object.entries(bookingStatusMap).map(([name, value]) => ({ name, value }))
        );

        const ticketStatusMap = tickets.reduce((acc, ticket) => {
          const label = normalizeTicketStatus(ticket?.status || "Open");
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {});

        setTicketStatusData(
          Object.entries(ticketStatusMap).map(([name, value]) => ({ name, value }))
        );

        const resourceCounts = bookings.reduce((acc, booking) => {
          const name = booking?.resourceName || "Unknown";
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        const topResources = Object.entries(resourceCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setTopResourcesData(topResources);

        const last7Days = [...Array(7)].map((_, index) => {
          const day = new Date();
          day.setDate(day.getDate() - (6 - index));
          return { key: day.toISOString().slice(0, 10), label: toShortDate(day) };
        });

        const bookingTrendMap = bookings.reduce((acc, booking) => {
          const key = toDateKey(booking?.bookingDate || booking?.createdAt);
          if (!key) {
            return acc;
          }
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        setBookingTrend(
          last7Days.map((day) => ({
            name: day.label,
            value: bookingTrendMap[day.key] || 0
          }))
        );
      } catch (err) {
        console.error("Error fetching admin dashboard stats:", err);
      }
    };
    fetchAdminStats();
  }, []);

  const adminStats = [
    { name: "Active Bookings", value: statsData.activeBookings.toString(), icon: "📅", link: "/admin/bookings" },
    { name: "Fault Reports", value: statsData.faultReports.toString(), icon: "🎫", link: "/admin/tickets" },
    { name: "System Notifications", value: statsData.notifications.toString(), icon: "🔔", link: "/admin/notifications" },
    { name: "Resource Catalogue", value: statsData.resourceCount.toString(), icon: "🏢", link: "/admin/resources" },
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

        <section className="dashboard-charts">
          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3>Booking Volume</h3>
            </div>
            <p className="chart-subtitle">Last 7 days</p>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2f61d3"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3>Booking Status</h3>
            </div>
            <p className="chart-subtitle">Pending vs Approved</p>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {bookingStatusData.map((entry) => (
                      <Cell key={entry.name} fill={statusPalette[entry.name] || "#2f61d3"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3>Ticket Pipeline</h3>
            </div>
            <p className="chart-subtitle">Open to Closed</p>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketStatusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {ticketStatusData.map((entry) => (
                      <Cell key={entry.name} fill={statusPalette[entry.name] || "#2f61d3"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3>Top Resources</h3>
            </div>
            <p className="chart-subtitle">Most booked assets</p>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topResourcesData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {topResourcesData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

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
