import React, { useState, useEffect } from "react";
import { getAllBookings, updateBookingStatus } from "../api/bookingService";

export default function AdminBookings() {
  const [filter, setFilter] = useState("ALL");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [reason, setReason] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError("Failed to load bookings.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    try {
      setError("");
      setSuccessMessage("");
      await updateBookingStatus(id, newStatus);
      setSuccessMessage(`Booking ${newStatus.toLowerCase()} successfully!`);
      setSelectedBooking(null);
      setReason("");
      await loadBookings();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update booking status.");
    }
  };

  const filteredBookings = bookings.filter((b) => filter === "ALL" || b.status === filter);

  const getStatusStyles = (status) => {
    switch (status) {
      case "APPROVED": return { bg: "#e6f4ea", text: "#1e7e34" };
      case "PENDING": return { bg: "#fff4e5", text: "#b45d00" };
      case "REJECTED": return { bg: "#fce8e6", text: "#d93025" };
      case "CANCELLED": return { bg: "#f1f3f4", text: "#5f6368" };
      default: return { bg: "#f1f3f4", text: "#5f6368" };
    }
  };

  return (
    <div className="tickets-page mesh-bg">
      <section className="tickets-hero" style={{ overflow: "hidden" }}>
        <div className="tickets-hero-overlay"></div>
        {/* Decorative Square Background */}
        <div style={{ 
          position: "absolute", 
          width: "350px", 
          height: "350px", 
          background: "rgba(255, 255, 255, 0.04)", 
          border: "1px solid rgba(255, 255, 255, 0.08)", 
          borderRadius: "32px", 
          top: "-100px", 
          right: "10%", 
          transform: "rotate(15deg)", 
          pointerEvents: "none",
          zIndex: 1
        }}></div>
        <div style={{ 
          position: "absolute", 
          width: "200px", 
          height: "200px", 
          background: "rgba(255, 255, 255, 0.02)", 
          border: "1px solid rgba(255, 255, 255, 0.05)", 
          borderRadius: "24px", 
          bottom: "-50px", 
          left: "5%", 
          transform: "rotate(-10deg)", 
          pointerEvents: "none",
          zIndex: 1
        }}></div>

        <div className="tickets-hero-content" style={{ position: "relative", zIndex: 2 }}>
          <h1>Admin Resource Bookings</h1>
          <p>Review and manage all resource booking requests across the campus.</p>
        </div>
      </section>

      <section className="tickets-content">
        <aside className="tickets-sidebar">
          <div className="tickets-filter-list" role="group" aria-label="Filters">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((f) => (
              <button
                key={f}
                type="button"
                className={`ticket-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                <span>{f}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="tickets-main">
          <header className="tickets-main-header">
            <div>
              <h2>Booking Requests</h2>
              <span>{isLoading ? "Loading..." : `${filteredBookings.length} shown`}</span>
            </div>
          </header>

          {error && <div className="ticket-card" style={{ color: '#d93025', padding: '16px', marginBottom: '16px' }}>{error}</div>}
          {successMessage && <div className="ticket-card" style={{ color: '#1e7e34', backgroundColor: '#e6f4ea', border: '1px solid #1e7e34', padding: '16px', marginBottom: '16px' }}>{successMessage}</div>}

          <div className="ticket-card resources-table-card">
            <div className="resources-table-wrap">
              <table className="resources-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="7" style={{ padding: "24px", textAlign: "center" }}>Loading bookings...</td></tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: "24px", textAlign: "center" }}>No bookings match this filter.</td></tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>{booking.resourceName}</strong>
                        </td>
                        <td style={{ fontSize: "14px" }}>{booking.requesterEmail}</td>
                        <td>{booking.bookingDate}</td>
                        <td>
                          {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                        </td>
                        <td>{booking.attendees || "-"}</td>
                        <td>
                          <span
                            className="status-badge-active"
                            style={{
                              ...getStatusStyles(booking.status),
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: "700",
                              display: "inline-block",
                              backgroundColor: getStatusStyles(booking.status).bg,
                              color: getStatusStyles(booking.status).text,
                            }}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {booking.status === "PENDING" ? (
                            <button className="user-nav-link" style={{ color: "var(--accent)" }} onClick={() => setSelectedBooking(booking)}>
                              Review
                            </button>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: "12px" }}>Finalized</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="glass-card" style={{ maxWidth: "500px", width: '100%' }}>
            <h2>Review Booking Request</h2>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <p>Requested by: <strong>{selectedBooking.requesterEmail}</strong></p>
              <p>Target Resource: <strong>{selectedBooking.resourceName}</strong></p>
              <p>Purpose: {selectedBooking.purpose}</p>
              <p>Attendees: {selectedBooking.attendees || "N/A"}</p>
            </div>
            
            <textarea
              className="role-chip"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)", backgroundColor: "#fff", height: "80px", cursor: "text" }}
              placeholder="Add review feedback or reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button 
                className="cta-btn" 
                style={{ flex: 1 }} 
                onClick={() => handleAction(selectedBooking.id, "APPROVED")}
              >
                Approve
              </button>
              <button 
                className="cta-btn" 
                style={{ flex: 1, backgroundColor: "#d93025", backgroundImage: "none" }} 
                onClick={() => handleAction(selectedBooking.id, "REJECTED")}
              >
                Reject
              </button>
              <button 
                type="button" 
                className="cta-btn secondary" 
                style={{ flex: 0.5 }} 
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
