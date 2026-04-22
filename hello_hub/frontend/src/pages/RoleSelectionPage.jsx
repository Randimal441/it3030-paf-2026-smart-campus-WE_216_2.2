import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const roles = ["STUDENT", "LECTURER", "TECHNICIAN"];

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
    <div className="page role-scene-bg">
      <div className="role-split-card">
        <div className="role-copy-column">
          <p className="login-eyebrow">First Login Setup</p>
          <h1 className="role-main-title">Select your access role</h1>
          <p className="role-main-text">
            Choose how you want to enter Smart Campus Operations Hub. This controls which
            dashboard and tools you can access.
          </p>

          <div className="role-option-grid">
            {roles.map((role) => (
              <button
                key={role}
                className={`role-option-btn ${selectedRole === role ? "active" : ""}`}
                onClick={() => setSelectedRole(role)}
                type="button"
              >
                <span className="role-option-title">{role}</span>
                <span className="role-option-subtitle">Access {role.toLowerCase()} workspace</span>
              </button>
            ))}
          </div>

          <button className="role-continue-btn" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Saving role..." : "Continue"}
          </button>
        </div>

        <div className="role-visual-column" aria-hidden="true">
          <div className="role-visual-glow" />
          <div className="role-badge role-badge-student">STUDENT</div>
          <div className="role-badge role-badge-lecturer">LECTURER</div>
          <div className="role-badge role-badge-technician">TECHNICIAN</div>
          <div className="role-badge role-badge-admin">ADMIN</div>
          <img
            className="role-visual-image"
            src="/login-card-photo.png"
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
