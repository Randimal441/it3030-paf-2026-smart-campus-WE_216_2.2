import { useEffect, useState } from "react";
import api from "../api/axiosClient";

export default function AdminApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/admin/users");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const approveUser = async (userId) => {
    setError("");
    setSuccess("");

    try {
      await api.patch(`/api/admin/users/${userId}/approve`);
      setUsers((previous) =>
        previous.map((user) =>
          user.id === userId ? { ...user, approved: true } : user
        )
      );
      setSuccess("User approved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to approve user.");
    }
  };

  return (
    <div className="page mesh-bg">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <p className="kicker">Access Control</p>
            <h1>Pending User Approvals</h1>
            <p>Approve new accounts before they can sign in.</p>
          </div>
          <button className="cta-btn secondary" onClick={loadUsers} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error ? (
          <div className="glass-card" style={{ color: "#d93025", padding: "16px", marginBottom: "16px" }}>
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            className="glass-card"
            style={{ color: "#1e7e34", backgroundColor: "#e6f4ea", border: "1px solid #1e7e34", padding: "16px", marginBottom: "16px" }}
          >
            {success}
          </div>
        ) : null}

        <div className="glass-card" style={{ padding: "24px", width: "100%" }}>
          <div className="resources-table-wrap" style={{ width: "100%" }}>
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "24px", textAlign: "center" }}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "24px", textAlign: "center" }}>
                      No users available right now.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "Unknown"}</td>
                      <td>{user.email || "No email"}</td>
                      <td>{user.provider || "LOCAL"}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                      <td>{user.approved === false ? "Pending" : "Approved"}</td>
                      <td style={{ textAlign: "right" }}>
                        {user.approved === false ? (
                          <button className="cta-btn" onClick={() => approveUser(user.id)}>
                            Approve
                          </button>
                        ) : (
                          <span style={{ color: "var(--muted)", fontSize: "12px" }}>No action</span>
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
    </div>
  );
}
