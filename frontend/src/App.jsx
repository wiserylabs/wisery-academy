import { useState } from "react";
import "./styles.css";
import { api } from "./api.js";
import Portal from "./components/Portal.jsx";

const LOGIN_FACTS = [
  "Six material tracks from the Wisery Academy certification program.",
  "Draft, publish and visibility controls for Editors, everyone else just downloads.",
  "A Technical Section for Tier 1 / Tier 2 support engineers only.",
];

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
        <div className="login-hero">
          <div className="login-wordmark">
            <span className="word">wisery</span>
            <span className="sub">Academy</span>
          </div>
          <div className="login-hero-body">
            <h1>Wisery Academy Portal</h1>
            <p>
              Training decks, lab guides, sample datasets and technical documentation for the Wisery
              certification program.
            </p>
            <ul className="login-facts">
              {LOGIN_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="login-panel">
          <h2>Sign in to the portal</h2>
          <p className="muted small">Use the work email your Editor set you up with.</p>
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
            Phase-0 wiring is done; this is now the real Editor CMS — upload, publish, and visibility all talk to
            the live API.
          </p>
        </div>
      </main>
    );
  }

  return <Portal user={user} onLogout={handleLogout} />;
}
