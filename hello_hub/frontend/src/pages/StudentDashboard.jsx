import api from "../api/axiosClient";
import DashboardLayout from "./DashboardLayout";

export default function StudentDashboard() {
  const createBooking = async () => {
    const res = await api.post("/api/student/bookings");
    alert(res.data.message);
  };

  const reportIncident = async () => {
    const res = await api.post("/api/student/incidents");
    alert(res.data.message);
  };

  return (
    <DashboardLayout
      title="Student Operations"
      subtitle="Request facilities and report incidents through tracked workflows."
    >
      <div className="panel-grid">
        <article className="glass-card">
          <h3>Bookings</h3>
          <button className="cta-btn" onClick={createBooking}>
            Create Booking
          </button>
        </article>
        <article className="glass-card">
          <h3>Incidents</h3>
          <button className="cta-btn" onClick={reportIncident}>
            Report Incident
          </button>
        </article>
      </div>
    </DashboardLayout>
  );
}
