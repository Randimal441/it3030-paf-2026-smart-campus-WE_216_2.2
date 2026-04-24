import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const roles = ["STUDENT", "LECTURER", "TECHNICIAN"];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setUser, loginWithToken, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState("STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const approval = params.get("approval");
    if (approval === "pending") {
      setNotice("Your account is pending admin approval. Select your role to continue.");
      return undefined;
    }
    setNotice("");
    return undefined;
  }, [params, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/api/auth/select-role", { role: selectedRole });
      if (res.data?.user?.approved === false) {
        logout();
        setNotice("Your account is pending admin approval. Redirecting to sign in...");
        setTimeout(() => {
          navigate("/login?approval=pending", { replace: true });
        }, 2000);
        return;
      }

      loginWithToken(res.data.token);
      setUser(res.data.user);
      navigate(`/${selectedRole.toLowerCase()}`, { replace: true });
    } catch (requestError) {
      const status = requestError?.response?.status;
      if (status === 403) {
        logout();
        navigate("/login?approval=pending", { replace: true });
        return;
      }
      setError(requestError?.response?.data?.message || "Unable to save role. Please try again.");
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

          {notice ? <div className="form-alert">{notice}</div> : null}
          {error ? <div className="form-alert error">{error}</div> : null}

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
