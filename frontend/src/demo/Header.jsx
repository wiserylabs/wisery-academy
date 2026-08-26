import { ROLES } from "./data.js";
import { Avatar, Icon } from "./ui.jsx";

function Wordmark({ onClick }) {
  return (
    <button type="button" className="wordmark" onClick={onClick} aria-label="Wisery Academy home">
      <span className="wordmark-brand">wisery</span>
      <span className="wordmark-sub">ACADEMY</span>
    </button>
  );
}

export default function Header({ state, actions }) {
  const me = ROLES[state.role];
  const navItems = [
    { key: "home", label: "Home", route: "home" },
    { key: "faq", label: "FAQ", route: "faq" },
    { key: "contact", label: "Contact", route: "contact" },
  ];

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Wordmark onClick={() => actions.go("home")} />

        <nav className="app-nav">
          {navItems.map((n) => (
            <button
              key={n.key}
              type="button"
              className={`nav-link ${state.route === n.route ? "active" : ""}`}
              onClick={() => actions.go(n.route)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="header-search">
          <Icon name="search" size={15} className="header-search-icon" />
          <input
            type="search"
            placeholder="Search all materials…"
            aria-label="Search all materials"
            value={state.query}
            onChange={(e) => actions.setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && actions.submitSearch(e.target.value)}
          />
        </div>

        <div className="viewing-as">
          <span className="viewing-as-label">Viewing as</span>
          <div className="role-toggle" role="group" aria-label="Demo role switcher">
            {Object.keys(ROLES).map((k) => (
              <button
                key={k}
                type="button"
                className={`role-toggle-btn ${state.role === k ? "active" : ""}`}
                onClick={() => actions.setRole(k)}
              >
                {ROLES[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="header-user">
          <Avatar initials={me.initials} size={34} />
          <div className="header-user-id">
            <span className="header-user-name">{me.name}</span>
            <span className="header-user-role">{me.role}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={actions.signOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <Icon name="signout" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
