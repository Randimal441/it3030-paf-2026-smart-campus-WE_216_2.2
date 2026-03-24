import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const roles = ["STUDENT", "LECTURER", "TECHNICIAN", "ADMIN"];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { setUser, loginWithToken } = useAuth();
  const [selectedRole, setSelectedRole] = useState("STUDENT");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/select-role", { role: selectedRole });
      loginWithToken(res.data.token);
      setUser(res.data.user);
      navigate(`/${selectedRole.toLowerCase()}`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page mesh-bg">
      <div className="glass-card card-wide">
        <p className="kicker">First Login Setup</p>
        <h2>Select your access role</h2>
        <p>This controls which dashboard and APIs you can access.</p>

        <div className="role-grid">
          {roles.map((role) => (
            <button
              key={role}
              className={`role-chip ${selectedRole === role ? "active" : ""}`}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <button className="cta-btn" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Saving role..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
