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

  const startLogin = () => {
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="page login-scene-bg">
      <div className="login-split-card">
        <div className="login-copy-column">
          <p className="login-eyebrow">Smart Campus Operations Hub</p>
          <h1 className="login-main-title">Operate campus services with SCO HUB</h1>
          <p className="login-main-text">
            Sign in with your university Google account to get started. You will choose your role
            on the next screen.
          </p>

          <button className="google-signin-btn" onClick={startLogin}>
            <span className="google-signin-icon" aria-hidden="true">
              G
            </span>
            Sign in with Google
          </button>
        </div>

        <div className="login-visual-column" aria-hidden="true">
          <img
            className="login-visual-image"
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
