import { Icon, Pips } from "../demo/ui.jsx";
import { formatDate } from "./format.js";

function ProgressPanel({ tracks }) {
  const published = tracks.reduce((s, t) => s + (t.published_count || 0), 0);
  const downloaded = tracks.reduce((s, t) => s + (t.downloaded_count || 0), 0);
  const files = tracks.reduce((s, t) => s + (t.file_count || 0), 0);
  const pct = published ? Math.round((downloaded / published) * 100) : 0;

  return (
    <aside className="progress-panel">
      <span className="panel-kicker">Your progress</span>
      <div className="progress-headline">
        <span className="progress-big">{downloaded}</span>
        <span className="progress-of">of {published} files downloaded</span>
      </div>
      <div className="progress-bar">
        <span className="progress-bar-fill" style={{ width: `${pct}%` }} />
        <span className="progress-bar-pct">{pct}%</span>
      </div>
      <dl className="progress-rows">
        <div className="progress-row"><dt>Material tracks</dt><dd>{tracks.length}</dd></div>
        <div className="progress-row"><dt>Files available</dt><dd>{files}</dd></div>
        <div className="progress-row"><dt>Certification exam</dt><dd className="accent">Opens 14 Sep</dd></div>
      </dl>
    </aside>
  );
}

function TrackCard({ track, onOpen }) {
  const num = String(track.sort_order || 0).padStart(2, "0");
  const total = track.published_count || 0;
  const done = track.downloaded_count || 0;
  return (
    <button type="button" className="track-card" onClick={onOpen}>
      <div className="track-card-top">
        <span className="track-card-num">{num}</span>
        <span className="track-card-count">{track.file_count} {track.file_count === 1 ? "FILE" : "FILES"}</span>
      </div>
      <h3 className="track-card-title">{track.title}</h3>
      <p className="track-card-blurb">{track.description}</p>
      <div className="track-card-foot">
        <div className="track-card-updated">
          <span className="track-card-updated-label">Updated</span>
          <span className="track-card-updated-date">{track.updated_at ? formatDate(track.updated_at) : "—"}</span>
        </div>
        <div className="track-card-foot-right">
          {total > 0 && <Pips done={Math.min(done, 12)} total={Math.min(total, 12)} />}
          <span className={`track-card-done ${done === 0 ? "zero" : ""}`}>{done}/{total}</span>
          <span className="track-card-open">Open <Icon name="arrow" size={13} /></span>
        </div>
      </div>
    </button>
  );
}

export default function Home({ tracks, tracksError, actions }) {
  const material = tracks.filter((t) => t.slug !== "technical-section");
  const technical = tracks.find((t) => t.slug === "technical-section");
  const totalFiles = material.reduce((s, t) => s + (t.file_count || 0), 0);
  const latest = material
    .map((t) => t.updated_at)
    .filter(Boolean)
    .sort()
    .pop();

  const openTechnical = () => {
    if (!technical) return;
    // Students get the locked explainer; Technical/Editor open the real folder.
    if (technical.file_count > 0) actions.go("category", { trackId: technical.id });
    else actions.go("technical");
  };

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
        <ProgressPanel tracks={material} />
      </section>

      <section className="tracks-section">
        <div className="tracks-section-head">
          <h2>Material tracks</h2>
          <span className="tracks-meta">
            {material.length} tracks · {totalFiles} files{latest ? ` · last updated ${formatDate(latest)}` : ""}
          </span>
        </div>

        {tracksError && <p className="error-banner">{tracksError}</p>}

        <div className="track-grid">
          {material.map((t) => (
            <TrackCard key={t.id} track={t} onOpen={() => actions.go("category", { trackId: t.id })} />
          ))}
        </div>

        {technical && (
          <button type="button" className="technical-card" onClick={openTechnical}>
            <div className="technical-card-body">
              <span className="pill restricted"><Icon name="lock" size={12} /> Restricted</span>
              <h3>{technical.title}</h3>
              <p>{technical.description}</p>
              <span className="technical-card-cta">
                {technical.file_count > 0 ? "Open Technical Section" : "See access requirements"} <Icon name="arrow" size={13} />
              </span>
            </div>
          </button>
        )}
      </section>
    </div>
  );
}
