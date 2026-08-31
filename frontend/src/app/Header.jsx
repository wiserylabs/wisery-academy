import { useState } from "react";
import { Avatar, Icon } from "../demo/ui.jsx";
import { ROLE_SHORT, initialsOf } from "./format.js";

const ROLES = ["student", "technical", "editor"];

export default function Header({ user, route, actions }) {
  const [q, setQ] = useState("");
  const nav = [
    { key: "home", label: "Home" },
    { key: "faq", label: "FAQ" },
    { key: "contact", label: "Contact" },
  ];

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button type="button" className="wordmark" onClick={() => actions.go("home")} aria-label="Wisery Academy home">
          <span className="wordmark-brand">wisery</span>
          <span className="wordmark-sub">ACADEMY</span>
        </button>

        <nav className="app-nav">
          {nav.map((n) => (
            <button key={n.key} type="button" className={`nav-link ${route.name === n.key ? "active" : ""}`} onClick={() => actions.go(n.key)}>
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && actions.go("search", { query: e.target.value })}
          />
        </div>

        <div className="viewing-as">
          <span className="viewing-as-label">Viewing as</span>
          <div className="role-toggle" role="group" aria-label="Sign in as a different demo role">
            {ROLES.map((r) => (
              <button key={r} type="button" className={`role-toggle-btn ${user.role === r ? "active" : ""}`} onClick={() => actions.loginAs(r)}>
                {ROLE_SHORT[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="header-user">
          <Avatar initials={initialsOf(user)} size={34} />
          <div className="header-user-id">
            <span className="header-user-name">{user.full_name || user.email}</span>
            <span className="header-user-role">{ROLE_SHORT[user.role] || user.role}</span>
          </div>
          <button type="button" className="icon-btn" onClick={actions.logout} aria-label="Sign out" title="Sign out">
            <Icon name="signout" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
