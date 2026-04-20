import React, { useState, useEffect } from "react";
import { getMyBookings, createBooking, deleteBooking } from "../api/bookingService";
import { getAllResources } from "../api/resourceService";
import { useLocation } from "react-router-dom";

export default function Userbookings() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // If navigation passed a selected resource, auto-fill its details
    if (location.state?.selectedResource) {
      setFormData(prev => ({ 
        ...prev, 
        resourceId: location.state.selectedResource,
        bookingDate: location.state.date || "",
        startTime: location.state.startTime || "",
        endTime: location.state.endTime || "",
      }));
      setShowModal(true);
    }
  }, [location.state]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        getMyBookings(),
        getAllResources()
      ]);
      setBookings(bookingsRes.data || []);
      setResources(resourcesRes.data?.filter(r => r.status === 'ACTIVE') || []);
    } catch (err) {
      setError("Failed to load booking data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccessMessage("");
      // Simple validation
      if (!formData.resourceId) {
        setError("Please select a resource.");
        return;
      }

      await createBooking({
        ...formData,
        attendees: parseInt(formData.attendees) || 0
      });
      
      setSuccessMessage("Booking request submitted successfully!");
      setShowModal(false);
      setFormData({ resourceId: "", bookingDate: "", startTime: "", endTime: "", purpose: "", attendees: "" });
      await loadData();
      
      // Clear message after 3s
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking.");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await deleteBooking(id);
      await loadData();
    } catch (err) {
      setError("Failed to cancel booking.");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "APPROVED": return { bg: "#e6f4ea", text: "#1e7e34" };
      case "PENDING": return { bg: "#fff4e5", text: "#b45d00" };
      case "REJECTED":
      case "CANCELLED": return { bg: "#fce8e6", text: "#d93025" };
      default: return { bg: "#f1f3f4", text: "#5f6368" };
    }
  };

  return (
    <div className="tickets-page">
      <section className="tickets-hero">
        <div className="tickets-hero-overlay"></div>
        <div className="tickets-hero-content">
          <h1>My Bookings</h1>
          <p>Request and manage your facility and resource bookings efficiently.</p>
        </div>
      </section>

      <section className="tickets-content">
        <aside className="tickets-sidebar">
          <button className="raise-ticket-btn" onClick={() => setShowModal(true)}>
            <span aria-hidden="true">+</span>
            New Booking
          </button>
        </aside>

        <div className="tickets-main">
          <header className="tickets-main-header">
            <div>
              <h2>Resource Bookings</h2>
              <span>{isLoading ? "Loading..." : `${bookings.length} reservations`}</span>
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
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center" }}>Loading your bookings...</td></tr>
                  ) : bookings.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center" }}>No bookings found. Try requesting one!</td></tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>{booking.resourceName}</strong>
                        </td>
                        <td>{booking.bookingDate}</td>
                        <td>
                          {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
                        </td>
                        <td>
                          <span
                            className="status-badge-active" // Using existing pulse animation class
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
                          {(booking.status === "PENDING" || booking.status === "APPROVED") && (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

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
          <div className="glass-card" style={{ maxWidth: "500px", width: '100%' }}>
            <h2>Request Booking</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Resource</label>
                <select 
                  name="resourceId" 
                  className="role-chip" 
                  style={{ width: "100%" }} 
                  required 
                  onChange={handleInputChange}
                  value={formData.resourceId}
                >
                  <option value="">Select a resource</option>
                  {resources.map(res => (
                    <option key={res.id} value={res.id}>{res.name} ({res.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Date</label>
                <input 
                  type="date" 
                  name="bookingDate" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline)" }} 
                  required 
                  onChange={handleInputChange}
                  value={formData.bookingDate}
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
