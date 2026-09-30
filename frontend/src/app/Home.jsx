import { useState } from "react";
import { Icon, Pips } from "../demo/ui.jsx";
import ExamSettingsModal from "./ExamSettingsModal.jsx";
import { formatDate, monthDay } from "./format.js";

function ExamRow({ settings, role, tracks, actions }) {
  const [editing, setEditing] = useState(false);
  const status = settings?.exam_status || "unset";
  const open = status === "open";
  const trackId = settings?.exam_track;

  let text = "Not scheduled";
  let tone = "dim";
  if (status === "open") {
    text = settings.exam_closes_at ? `Closes ${monthDay(settings.exam_closes_at)}` : "Open now";
    tone = "accent";
  } else if (status === "upcoming") {
    text = `Opens ${monthDay(settings.exam_opens_at)}`;
    tone = "accent";
  } else if (status === "closed") {
    text = "Closed";
  }

  return (
    <div className="progress-row exam-row">
      <dt>
        {open && trackId ? (
          <button type="button" className="exam-link" onClick={() => actions.go("category", { trackId })}>
            Certification exam <Icon name="arrow" size={12} />
          </button>
        ) : (
          <span>Certification exam</span>
        )}
        {role === "editor" && (
          <button type="button" className="icon-btn xs exam-edit" title="Edit exam window" onClick={() => setEditing(true)}>
            <Icon name="pencil" size={13} />
          </button>
        )}
      </dt>
      <dd className={tone}>{text}</dd>
      {editing && (
        <ExamSettingsModal settings={settings} tracks={tracks} actions={actions} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

function ProgressPanel({ tracks, settings, role, actions }) {
  // Progress is measured against required reading: Y = must-read files the
  // user can see, X = how many of those they've downloaded.
  const mustRead = tracks.reduce((s, t) => s + (t.must_read_count || 0), 0);
  const mustReadDone = tracks.reduce((s, t) => s + (t.must_read_downloaded_count || 0), 0);
  const pct = mustRead ? Math.round((mustReadDone / mustRead) * 100) : 0;
  const material = tracks.filter((t) => t.slug !== "technical-section");
  const files = material.reduce((s, t) => s + (t.file_count || 0), 0);

  return (
    <aside className="progress-panel">
      <span className="panel-kicker">Your progress</span>
      <div className="progress-headline">
        <span className="progress-big">{mustReadDone}</span>
        <span className="progress-of">
          {mustRead > 0 ? `of ${mustRead} must-read ${mustRead === 1 ? "file" : "files"} done` : "no required reading yet"}
        </span>
      </div>
      <div className="progress-bar">
        <span className="progress-bar-fill" style={{ width: `${pct}%` }} />
        <span className="progress-bar-pct">{pct}%</span>
      </div>
      <dl className="progress-rows">
        <div className="progress-row"><dt>Required reading</dt><dd>{mustReadDone}/{mustRead}</dd></div>
        <div className="progress-row"><dt>Files available</dt><dd>{files}</dd></div>
        <ExamRow settings={settings} role={role} tracks={tracks} actions={actions} />
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

export default function Home({ tracks, tracksError, role, settings, actions }) {
  const material = tracks.filter((t) => t.slug !== "technical-section");
  const technical = tracks.find((t) => t.slug === "technical-section");
  const totalFiles = material.reduce((s, t) => s + (t.file_count || 0), 0);
  const latest = material
    .map((t) => t.updated_at)
    .filter(Boolean)
    .sort()
    .pop();

  const canSeeTechnical = role === "technical" || role === "editor";
  const openTechnical = () => {
    if (!technical) return;
    // Role decides — Students get the locked explainer, never the file list;
    // Technical/Editor open the real folder.
    if (canSeeTechnical) actions.go("category", { trackId: technical.id });
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
        <ProgressPanel tracks={tracks} settings={settings} role={role} actions={actions} />
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
                {canSeeTechnical ? "Open Technical Section" : "See access requirements"} <Icon name="arrow" size={13} />
              </span>
            </div>
          </button>
        )}
      </section>
    </div>
  );
}
