import api from "../api/axiosClient";
import DashboardLayout from "./DashboardLayout";

export default function TechnicianDashboard() {
  const updateIncident = async () => {
    const res = await api.put("/api/technician/incidents");
    alert(res.data.message);
  };

  return (
    <DashboardLayout
      title="Technician Operations"
      subtitle="Maintain service uptime and close operational incidents."
    >
      <div className="panel-grid">
        <article className="glass-card">
          <h3>Incident workflow</h3>
          <button className="cta-btn" onClick={updateIncident}>
            Update Incident Status
          </button>
        </article>
      </div>
    </DashboardLayout>
  );
}
