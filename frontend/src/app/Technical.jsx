import { Icon } from "../demo/ui.jsx";

// Shown only to Students — the folder exists, but its contents are gated to
// Technical and Editor roles (the API returns nothing for a Student, so there
// is nothing to list here beyond the titles of what's inside).
const INSIDE = [
  "Runbooks — operational procedures",
  "Troubleshooting & known issues index",
  "Release notes 2.0 → 2.9",
  "Architecture & deployment reference",
  "Escalation paths & on-call flows",
];

export default function Technical({ actions }) {
  return (
    <div className="technical">
      <button type="button" className="back-link" onClick={() => actions.go("home")}>
        <Icon name="back" size={15} /> All materials
      </button>

      <div className="tech-banner locked">
        <div className="tech-banner-icon"><Icon name="lock" size={22} /></div>
        <div className="tech-banner-body">
          <span className="pill restricted"><Icon name="lock" size={12} /> Restricted</span>
          <h1>Technical Section</h1>
          <p>Runbooks, release notes, escalation paths and deployment docs for Wisery Tier 1 and Tier 2 support engineers.</p>
          <div className="tech-banner-locked">
            <span>Limited to Tier 1 and Tier 2 support engineers and the platform on-call team.</span>
            <button type="button" className="btn btn-solid" onClick={() => actions.go("contact")}>
              Request access <Icon name="arrow" size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="tech-section-head">
        <h2>What's inside</h2>
        <span className="tracks-meta">5 collections · visible titles only</span>
      </div>

      <div className="tech-grid">
        {INSIDE.map((title) => (
          <div key={title} className="tech-card is-locked">
            <div className="tech-card-top">
              <Icon name="lock" size={16} className="tech-card-icon" />
              <span className="tech-tier">Tier 1+</span>
            </div>
            <h3>{title}</h3>
            <p>Title visible only — the content requires Technical access.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
