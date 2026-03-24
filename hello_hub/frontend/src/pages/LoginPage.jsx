import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user?.role) {
      navigate(`/${user.role.toLowerCase()}`, { replace: true });
    }
  }, [token, user, navigate]);

  const googleLoginUrl =
    import.meta.env.VITE_GOOGLE_LOGIN_URL ||
    "http://localhost:8080/oauth2/authorization/google";

  return (
    <div className="page hero-bg">
      <div className="glass-card card-wide">
        <p className="kicker">Smart Campus Operations Hub</p>
        <h1>Operate campus services with secure role-based control.</h1>
        <p>
          Continue with your institutional Google account. You will choose your role after the
          first successful sign-in.
        </p>
        <button className="cta-btn" onClick={() => (window.location.href = googleLoginUrl)}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
