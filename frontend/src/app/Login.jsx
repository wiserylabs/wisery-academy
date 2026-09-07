import { useState } from "react";
import { Avatar, Icon } from "../demo/ui.jsx";
import { DEMO_ACCOUNTS, ROLE_LABEL } from "./format.js";

const FACTS = [
  "Six material tracks from the certification program — decks, lab guides with instruction videos, prompt playbook, sample datasets, admin guide and exam prep.",
  "The Technical Section — runbooks, release notes, escalation paths — opens only for Tier 1 and Tier 2 support engineers.",
  "Editors manage folder contents in place: add, delete and annotate, with every action written to the audit log.",
];

const PICKER = ["student", "technical", "editor"];

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

          <button type="button" className="btn btn-outline btn-block sso" disabled={authBusy} onClick={() => actions.loginAs("student")}>
            <Icon name="shield" size={16} /> Continue with corporate SSO
          </button>

          <div className="login-or"><span>or sign in directly</span></div>

          <form className="login-form" onSubmit={(e) => { e.preventDefault(); actions.login(email, password); }}>
            <div className="field">
              <label>Work email</label>
              <input type="text" placeholder="name@organisation.gov" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <div className="field-label-row">
                <label>Password</label>
                <button type="button" className="link-btn">Forgot?</button>
              </div>
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

          <div className="demo-picker">
            <span className="demo-picker-label">Demo — sign in as</span>
            <ul className="demo-roles">
              {PICKER.map((role) => {
                const a = DEMO_ACCOUNTS[role];
                return (
                  <li key={role}>
                    <button type="button" className="demo-role" disabled={authBusy} onClick={() => actions.loginAs(role)}>
                      <Avatar initials={a.initials} size={38} />
                      <span className="demo-role-body">
                        <span className="demo-role-name">{a.name}</span>
                        <span className="demo-role-perm">{ROLE_LABEL[role]}</span>
                      </span>
                      <Icon name="arrow" size={16} className="demo-role-arrow" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      <p className="login-foot">
        Reachable only over the corporate VPN. Sessions, downloads and Technical Section access are logged.
      </p>
    </main>
  );
}
