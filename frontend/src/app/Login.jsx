import { useState } from "react";
import { Icon } from "../demo/ui.jsx";

const FACTS = [
  "Six material tracks from the certification program — decks, lab guides with instruction videos, prompt playbook, sample datasets, admin guide and exam prep.",
  "The Technical Section — runbooks, release notes, escalation paths — opens only for Tier 1 and Tier 2 support engineers.",
  "Editors manage folder contents in place: add, delete and annotate, with every action written to the audit log.",
];

export default function Login({ actions, authError, authBusy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  return (
    <main className="login">
      <div className="login-grid">
        <section className="login-hero">
          <div className="login-brand">
            <span className="wordmark-brand">wisery</span>
            <span className="wordmark-sub">ACADEMY</span>
          </div>
          <h1>Wisery Academy Portal</h1>
          <p className="login-lead">
            Training decks, lab guides, sample datasets and technical documentation for the
            Wisery certification program.
          </p>
          <ul className="login-facts">
            {FACTS.map((f, i) => (
              <li key={i}><Icon name="check" size={16} className="login-fact-check" /> {f}</li>
            ))}
          </ul>
          <div className="login-hero-foot">
            <span>Internal use only · Wisery Labs</span>
            <span className="vpn-badge"><span className="vpn-dot" /> Corporate VPN detected · 10.42.x.x</span>
          </div>
        </section>

        <section className="login-panel">
          <h2>Sign in</h2>
          <p className="login-panel-sub">Use your organisation account. Access is granted by role, not by request.</p>

          <form className="login-form" onSubmit={(e) => { e.preventDefault(); actions.login(email, password); }}>
            <div className="field">
              <label>Work email</label>
              <input type="text" placeholder="name@organisation.gov" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
              <span>Keep me signed in on this device for 12 hours</span>
            </label>
            {authError && <p className="error-banner">{authError}</p>}
            <button type="submit" className="btn btn-solid btn-block" disabled={authBusy}>
              {authBusy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      </div>

      <p className="login-foot">
        Reachable only over the corporate VPN. Sessions, downloads and Technical Section access are logged.
      </p>
    </main>
  );
}
