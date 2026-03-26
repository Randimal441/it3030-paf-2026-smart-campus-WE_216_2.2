import api from "../api/axiosClient";

export default function AdminDashboard() {
  const loadUsers = async () => {
    const res = await api.get("/api/admin/users");
    alert(`Total users: ${res.data.length}`);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard! Here you can manage resources, bookings, and tickets.</p>
      <button className="cta-btn" onClick={loadUsers}>Load Users</button>
    
    </div>
  );
}
