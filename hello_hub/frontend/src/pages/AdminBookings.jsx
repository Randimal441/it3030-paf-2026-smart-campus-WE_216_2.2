import React, { useState } from "react";

export default function AdminBookings() {
  const [filter, setFilter] = useState("ALL");
  const [bookings, setBookings] = useState([
    {
      id: 1,
      user: "John Doe",
      resource: "Conference Room A",
      date: "2026-04-10",
      startTime: "10:00",
      endTime: "12:00",
      status: "PENDING",
      purpose: "Project Kick-off Meeting",
      attendees: 10,
    },
    {
      id: 2,
      user: "Jane Smith",
      resource: "Lab 101",
      date: "2026-04-11",
      startTime: "09:00",
      endTime: "11:00",
      status: "APPROVED",
      purpose: "Practical Session",
      attendees: 15,
    },
    {
      id: 3,
      user: "Mike Johnson",
      resource: "Projector B",
      date: "2026-04-12",
      startTime: "14:00",
      endTime: "15:00",
      status: "REJECTED",
      purpose: "Presentation",
      attendees: 5,
    },
  ]);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reason, setReason] = useState("");

  const handleAction = (id, newStatus) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus, rejectionReason: reason } : b)));
    setSelectedBooking(null);
    setReason("");
  };

  const filteredBookings = bookings.filter((b) => filter === "ALL" || b.status === filter);

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <div className="dashboard-header" style={{ marginBottom: "20px" }}>
          <div>
            <h1>Admin Resource Bookings</h1>
            <p>Review and manage all resource booking requests across the campus.</p>
          </div>
          <div className="user-nav-links" style={{ backgroundColor: "var(--glass)", padding: "10px", borderRadius: "12px", border: "1px solid var(--outline)" }}>
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
              <button
                key={f}
                className={`user-nav-link ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                style={{ fontSize: "12px" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ width: "100%" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--outline)" }}>
                  <th style={{ padding: "12px" }}>User</th>
                  <th style={{ padding: "12px" }}>Resource</th>
                  <th style={{ padding: "12px" }}>Time Slot</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid var(--outline)" }}>
                    <td style={{ padding: "12px" }}>
                      <strong>{booking.user}</strong>
                    </td>
                    <td style={{ padding: "12px" }}>{booking.resource}</td>
                    <td style={{ padding: "12px" }}>
                      {booking.date} {booking.startTime} - {booking.endTime}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        className={`badge ${booking.status.toLowerCase()}`}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            booking.status === "APPROVED"
                              ? "#e6f4ea"
                              : booking.status === "PENDING"
                              ? "#fff4e5"
                              : "#fce8e6",
                          color:
                            booking.status === "APPROVED"
                              ? "#1e7e34"
                              : booking.status === "PENDING"
                              ? "#b45d00"
                              : "#d93025",
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {booking.status === "PENDING" ? (
                        <button className="cta-btn" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => setSelectedBooking(booking)}>
                          Review
                        </button>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "13px" }}>Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
          <div className="glass-card" style={{ maxWidth: "500px" }}>
            <h2>Review Booking Request</h2>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <p>Requested by: <strong>{selectedBooking.user}</strong></p>
              <p>Target Resource: <strong>{selectedBooking.resource}</strong></p>
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
                Approve Request
              </button>
              <button 
                className="cta-btn" 
                style={{ flex: 1, backgroundColor: "#d93025", backgroundImage: "none" }} 
                onClick={() => handleAction(selectedBooking.id, "REJECTED")}
              >
                Reject Request
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
