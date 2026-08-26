import { useState } from "react";
import "./styles.css";
import { api } from "./api.js";
import Portal from "./components/Portal.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      await api.login(email, password);
      setUser(await api.me());
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    api.logout();
    setUser(null);
  }

  if (!user) {
    return (
      <main className="login-screen">
        <h1>wisery ACADEMY</h1>
        <p className="muted">Sign in to the portal.</p>
        <form onSubmit={handleLogin} className="login-form">
          <input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="primary">
            Sign in
          </button>
        </form>
        {error && <p className="error-banner">{error}</p>}
        <p className="muted small login-footnote">
          Phase-0 wiring is done; this is now the real Editor CMS — upload, publish, and visibility all talk to the
          live API.
        </p>
      </main>
    );
  }

  return <Portal user={user} onLogout={handleLogout} />;
}
