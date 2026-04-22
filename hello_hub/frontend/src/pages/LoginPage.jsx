import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginWithEmail, registerWithEmail } from "../api/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, token, loginWithToken, setUser } = useAuth();
  const [mode, setMode] = useState("signin");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const updateField = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const finalizeAuth = (payload) => {
    loginWithToken(payload.token);
    setUser(payload.user);

    if (!payload.user?.role) {
      navigate("/select-role", { replace: true });
      return;
    }

    navigate(`/${payload.user.role.toLowerCase()}`, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "signup" && formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const response = await registerWithEmail({
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          password: formValues.password
        });
        finalizeAuth(response.data);
      } else {
        const response = await loginWithEmail({
          email: formValues.email.trim(),
          password: formValues.password
        });
        finalizeAuth(response.data);
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to authenticate. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page login-scene-bg">
      <div className="login-split-card">
        <div className="login-copy-column">
          <p className="login-eyebrow">Smart Campus Operations Hub</p>
          <h1 className="login-main-title">Operate campus services with SCO HUB</h1>
          <p className="login-main-text">
            Use your university Google account or sign up with email and password. You will choose
            your role on the next screen.
          </p>

          <button className="google-signin-btn" onClick={startLogin}>
            <span className="google-signin-icon" aria-hidden="true">
              G
            </span>
            Sign in with Google
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-mode-toggle">
            <button
              type="button"
              className={`user-nav-link${mode === "signin" ? " active" : ""}`}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`user-nav-link${mode === "signup" ? " active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <div className="form-group">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={formValues.name}
                  onChange={updateField("name")}
                  required
                />
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={formValues.email}
                onChange={updateField("email")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={formValues.password}
                  onChange={updateField("password")}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M12 5c5.05 0 9.13 3.45 10.43 7-1.3 3.55-5.38 7-10.43 7S2.87 15.55 1.57 12C2.87 8.45 6.95 5 12 5zm0 2c-3.62 0-6.74 2.25-8.02 5 1.28 2.75 4.4 5 8.02 5 3.62 0 6.74-2.25 8.02-5-1.28-2.75-4.4-5-8.02-5zm0 2.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M4.27 3L3 4.27l3.08 3.08C3.73 8.65 2.3 10.44 1.57 12c1.3 3.55 5.38 7 10.43 7 1.66 0 3.23-.33 4.67-.9L19.73 21 21 19.73 4.27 3zM12 17c-3.62 0-6.74-2.25-8.02-5 .66-1.42 1.9-2.92 3.6-3.97l1.53 1.53A3.98 3.98 0 008 12a4 4 0 006.44 3.08l1.5 1.5c-1.22.27-2.54.42-3.94.42zm0-9a4 4 0 013.95 4.63l-1.57-1.57a2.5 2.5 0 00-3.44-3.44L9.37 6.05A3.98 3.98 0 0112 8zm8.45 3.3c-.88 2.02-2.52 3.86-4.7 5.02l-1.42-1.42c1.51-.82 2.7-2.12 3.39-3.66-.84-1.9-2.46-3.64-4.59-4.72A9.6 9.6 0 0012 7c-.64 0-1.27.06-1.87.17L8.6 5.64A11.8 11.8 0 0112 5c5.05 0 9.13 3.45 10.43 7a12.8 12.8 0 01-1.98 3.3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" ? (
              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm password</label>
                <div className="password-field">
                  <input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formValues.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M12 5c5.05 0 9.13 3.45 10.43 7-1.3 3.55-5.38 7-10.43 7S2.87 15.55 1.57 12C2.87 8.45 6.95 5 12 5zm0 2c-3.62 0-6.74 2.25-8.02 5 1.28 2.75 4.4 5 8.02 5 3.62 0 6.74-2.25 8.02-5-1.28-2.75-4.4-5-8.02-5zm0 2.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M4.27 3L3 4.27l3.08 3.08C3.73 8.65 2.3 10.44 1.57 12c1.3 3.55 5.38 7 10.43 7 1.66 0 3.23-.33 4.67-.9L19.73 21 21 19.73 4.27 3zM12 17c-3.62 0-6.74-2.25-8.02-5 .66-1.42 1.9-2.92 3.6-3.97l1.53 1.53A3.98 3.98 0 008 12a4 4 0 006.44 3.08l1.5 1.5c-1.22.27-2.54.42-3.94.42zm0-9a4 4 0 013.95 4.63l-1.57-1.57a2.5 2.5 0 00-3.44-3.44L9.37 6.05A3.98 3.98 0 0112 8zm8.45 3.3c-.88 2.02-2.52 3.86-4.7 5.02l-1.42-1.42c1.51-.82 2.7-2.12 3.39-3.66-.84-1.9-2.46-3.64-4.59-4.72A9.6 9.6 0 0012 7c-.64 0-1.27.06-1.87.17L8.6 5.64A11.8 11.8 0 0112 5c5.05 0 9.13 3.45 10.43 7a12.8 12.8 0 01-1.98 3.3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {error ? <div className="form-alert error">{error}</div> : null}

            <button className="cta-btn" type="submit" disabled={submitting}>
              {submitting
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : "Sign in with email"}
            </button>
          </form>
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
