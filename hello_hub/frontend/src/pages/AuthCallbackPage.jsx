import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken, fetchMe } = useAuth();

  useEffect(() => {
    const completeLogin = async () => {
      const token = params.get("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      loginWithToken(token);
      const me = await fetchMe();

      if (!me?.role) {
        navigate("/select-role", { replace: true });
        return;
      }

      navigate(`/${me.role.toLowerCase()}`, { replace: true });
    };

    completeLogin();
  }, [params, navigate, loginWithToken, fetchMe]);

  return (
    <div className="page hero-bg">
      <div className="glass-card">
        <h2>Finishing authentication...</h2>
      </div>
    </div>
  );
}
