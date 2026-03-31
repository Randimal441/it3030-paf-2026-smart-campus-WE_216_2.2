import React, { useState } from "react";

export default function Userbookings() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    resource: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });

  // Mock data for existing user bookings
  const [bookings, setBookings] = useState([
    {
      id: 1,
      resource: "Conference Room A",
      date: "2026-04-10",
      startTime: "10:00",
      endTime: "12:00",
      status: "APPROVED",
    },
    {
      id: 2,
      resource: "Projector B",
      date: "2026-04-12",
      startTime: "14:00",
      endTime: "16:00",
      status: "PENDING",
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBooking = {
      id: Date.now(),
      ...formData,
      status: "PENDING",
    };
    setBookings([newBooking, ...bookings]);
    setShowModal(false);
    setFormData({ resource: "", date: "", startTime: "", endTime: "", purpose: "", attendees: "" });
  };

  const handleCancel = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
  };

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h1>My Bookings</h1>
            <p>Request and manage your resource bookings.</p>
          </div>
          <button className="cta-btn" onClick={() => setShowModal(true)}>
            + New Booking
          </button>
        </div>

        <div className="glass-card" style={{ width: "100%", marginTop: "20px" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--outline)" }}>
                  <th style={{ padding: "12px" }}>Resource</th>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px" }}>Time Slot</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid var(--outline)" }}>
                    <td style={{ padding: "12px" }}>{booking.resource}</td>
                    <td style={{ padding: "12px" }}>{booking.date}</td>
                    <td style={{ padding: "12px" }}>
                      {booking.startTime} - {booking.endTime}
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
                    <td style={{ padding: "12px" }}>
                      {booking.status === "APPROVED" && (
                        <button 
                          className="user-nav-link" 
                          style={{ color: "#d93025", padding: "4px 8px" }}
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
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
            <h2>Request Booking</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Resource</label>
                <select 
                  name="resource" 
                  className="role-chip" 
                  style={{ width: "100%" }} 
                  required 
                  onChange={handleInputChange}
                  value={formData.resource}
                >
                  <option value="">Select a resource</option>
                  <option value="Conference Room A">Conference Room A</option>
                  <option value="Projector B">Projector B</option>
                  <option value="Lab 101">Lab 101</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }} 
                  required 
                  onChange={handleInputChange}
                  value={formData.date}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }} 
                    required 
                    onChange={handleInputChange}
                    value={formData.startTime}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>End Time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }} 
                    required 
                    onChange={handleInputChange}
                    value={formData.endTime}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Purpose</label>
                <textarea 
                  name="purpose" 
                  rows="3" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }} 
                  required 
                  placeholder="Reason for booking..."
                  onChange={handleInputChange}
                  value={formData.purpose}
                ></textarea>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Attendees (if applicable)</label>
                <input 
                  type="number" 
                  name="attendees" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }} 
                  placeholder="Approximate count"
                  onChange={handleInputChange}
                  value={formData.attendees}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="submit" className="cta-btn" style={{ flex: 1 }}>Submit Request</button>
                <button type="button" className="cta-btn secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
