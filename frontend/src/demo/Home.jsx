import { TRACKS } from "./data.js";
import { Icon, Pips } from "./ui.jsx";

const PROGRESS_ROWS = [
  { k: "Slide decks read", v: "3 / 5 days", tone: "" },
  { k: "Study guide", v: "Not started", tone: "dim" },
  { k: "Certification exam", v: "Opens 14 Sep", tone: "accent" },
];

function ProgressPanel() {
  return (
    <aside className="progress-panel">
      <span className="panel-kicker">Your progress</span>
      <div className="progress-headline">
        <span className="progress-big">4</span>
        <span className="progress-of">of 10 labs complete</span>
      </div>
      <div className="progress-bar">
        <span className="progress-bar-fill" style={{ width: "40%" }} />
        <span className="progress-bar-pct">40%</span>
      </div>
      <dl className="progress-rows">
        {PROGRESS_ROWS.map((r) => (
          <div key={r.k} className="progress-row">
            <dt>{r.k}</dt>
            <dd className={r.tone}>{r.v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function TrackCard({ track, onOpen }) {
  return (
    <button type="button" className="track-card" onClick={onOpen}>
      <div className="track-card-top">
        <span className="track-card-num">{track.num}</span>
        <span className="track-card-count">{track.count.toUpperCase()}</span>
      </div>
      <h3 className="track-card-title">{track.title}</h3>
      <p className="track-card-blurb">{track.blurb}</p>
      <div className="track-card-foot">
        <div className="track-card-updated">
          <span className="track-card-updated-label">Updated</span>
          <span className="track-card-updated-date">{track.meta}</span>
        </div>
        <div className="track-card-foot-right">
          <Pips done={track.done} total={track.total} />
          <span className={`track-card-done ${track.done === 0 ? "zero" : ""}`}>
            {track.done}/{track.total}
          </span>
          <span className="track-card-open">Open <Icon name="arrow" size={13} /></span>
        </div>
      </div>
    </button>
  );
}

function TechnicalCard({ role, onOpen }) {
  const cta = role === "user" ? "See access requirements" : "Open Technical Section";
  return (
    <button type="button" className="technical-card" onClick={onOpen}>
      <div className="technical-card-body">
        <span className="pill restricted">
          <Icon name="lock" size={12} /> Restricted
        </span>
        <h3>Technical Section</h3>
        <p>Runbooks, release notes, escalation paths and deployment docs for Wisery Tier 1 and Tier 2 support engineers.</p>
        <span className="technical-card-cta">{cta} <Icon name="arrow" size={13} /></span>
      </div>
    </button>
  );
}

export default function Home({ state, actions }) {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-title">Your full training package —<br />everything you received, in one place.</h1>
          <p className="hero-sub">
            Six material tracks from the Wisery Academy certification program. Download the
            latest version of any deck, guide, or dataset — and come back to it long after the
            course ends.
          </p>
        </div>
        <ProgressPanel />
      </section>

      <section className="tracks-section">
        <div className="tracks-section-head">
          <h2>Material tracks</h2>
          <span className="tracks-meta">6 tracks · 84 files · last updated 21 Aug 2026</span>
        </div>

        <div className="track-grid">
          {TRACKS.map((t) => (
            <TrackCard key={t.id} track={t} onOpen={() => actions.go("category", t.id)} />
          ))}
        </div>

        <TechnicalCard role={state.role} onOpen={() => actions.go("tech")} />
      </section>
    </div>
  );
}
