import { TECH } from "./data.js";
import { Icon } from "./ui.jsx";

export default function Technical({ state, actions }) {
  const locked = state.role === "user";
  const heading = locked ? "What's inside" : "Collections";
  const note = locked ? "7 collections · visible titles only" : "7 collections · access logged per open";
  const scopeNote = state.role === "editor" ? "full access, editable" : "Tier 2 scope";

  return (
    <div className="technical">
      <button type="button" className="back-link" onClick={() => actions.go("home")}>
        <Icon name="back" size={15} /> All materials
      </button>

      <div className={`tech-banner ${locked ? "locked" : "unlocked"}`}>
        <div className="tech-banner-icon"><Icon name={locked ? "lock" : "shield"} size={22} /></div>
        <div className="tech-banner-body">
          <span className="pill restricted"><Icon name="lock" size={12} /> Restricted</span>
          <h1>Technical Section</h1>
          <p>Runbooks, release notes, escalation paths and deployment docs for Wisery Tier 1 and Tier 2 support engineers.</p>
          {locked ? (
            <div className="tech-banner-locked">
              <span>Limited to Tier 1 and Tier 2 support engineers and the platform on-call team.</span>
              <button type="button" className="btn btn-solid" onClick={() => actions.go("contact")}>
                Request access <Icon name="arrow" size={13} />
              </button>
            </div>
          ) : (
            <span className="tech-scope">Signed in with {scopeNote} · every open is written to the audit log.</span>
          )}
        </div>
      </div>

      <div className="tech-section-head">
        <h2>{heading}</h2>
        <span className="tracks-meta">{note}</span>
      </div>

      <div className="tech-grid">
        {TECH.map((c, i) => {
          const open = !locked;
          return (
            <button
              key={i}
              type="button"
              className={`tech-card ${open ? "" : "is-locked"}`}
              onClick={open ? () => actions.flash(c.title + " — opening is recorded in the audit log.") : () => actions.go("contact")}
            >
              <div className="tech-card-top">
                <Icon name={open ? "shield" : "lock"} size={16} className="tech-card-icon" />
                <span className={`tech-tier ${open ? "open" : ""}`}>{open ? c.tier + " · open" : c.tier}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <span className="tech-count">{c.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
