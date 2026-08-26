import { LOGIN_FACTS, LOGIN_ROLES } from "./data.js";
import { Avatar, Icon } from "./ui.jsx";

export default function Login({ state, actions }) {
  const { login } = state;
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
            {LOGIN_FACTS.map((f, i) => (
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

          <button type="button" className="btn btn-outline btn-block sso" onClick={() => actions.signIn("user")}>
            <Icon name="shield" size={16} /> Continue with corporate SSO
          </button>

          <div className="login-or"><span>or sign in directly</span></div>

          <form
            className="login-form"
            onSubmit={(e) => { e.preventDefault(); actions.signIn("user"); }}
          >
            <div className="field">
              <label>Work email</label>
              <input
                type="text"
                placeholder="name@organisation.gov"
                value={login.email}
                onChange={(e) => actions.setLogin({ email: e.target.value })}
              />
            </div>
            <div className="field">
              <div className="field-label-row">
                <label>Password</label>
                <button type="button" className="link-btn">Forgot?</button>
              </div>
              <input
                type="password"
                placeholder="••••••••••"
                value={login.password}
                onChange={(e) => actions.setLogin({ password: e.target.value })}
              />
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={login.remember}
                onChange={() => actions.setLogin({ remember: !login.remember })}
              />
              <span>Keep me signed in on this device for 12 hours</span>
            </label>
            <button type="submit" className="btn btn-solid btn-block">Sign in</button>
          </form>

          <div className="demo-picker">
            <span className="demo-picker-label">Demo — sign in as</span>
            <ul className="demo-roles">
              {LOGIN_ROLES.map((r) => (
                <li key={r.key}>
                  <button type="button" className="demo-role" onClick={() => actions.signIn(r.key)}>
                    <Avatar initials={r.initials} size={38} />
                    <span className="demo-role-body">
                      <span className="demo-role-name">{r.name}</span>
                      <span className="demo-role-perm">{r.perm}</span>
                    </span>
                    <Icon name="arrow" size={16} className="demo-role-arrow" />
                  </button>
                </li>
              ))}
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
