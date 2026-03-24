import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="page hero-bg">
      <div className="glass-card">
        <p className="kicker">403</p>
        <h2>You do not have access to this page.</h2>
        <Link className="cta-btn secondary" to="/">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
