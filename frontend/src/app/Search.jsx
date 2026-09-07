import { useEffect, useMemo } from "react";
import { Icon } from "../demo/ui.jsx";
import { humanSize } from "./format.js";

// Client-side search across the real tracks and their files. When the search
// route is entered we make sure every track's files are loaded, then filter.
export default function Search({ query, tracks, filesByTrack, actions }) {
  useEffect(() => {
    tracks.forEach((t) => {
      if (!(t.id in filesByTrack)) actions.loadFiles(t.id);
    });
  }, [tracks, filesByTrack, actions]);

  const q = (query || "").trim().toLowerCase();

  const { trackHits, fileHits } = useMemo(() => {
    if (!q) return { trackHits: [], fileHits: [] };
    const trackHits = tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)
    );
    const fileHits = [];
    tracks.forEach((t) => {
      (filesByTrack[t.id] || []).forEach((f) => {
        if (f.title.toLowerCase().includes(q) || (f.annotation || "").toLowerCase().includes(q)) {
          fileHits.push({ file: f, track: t });
        }
      });
    });
    return { trackHits, fileHits };
  }, [q, tracks, filesByTrack]);

  const total = trackHits.length + fileHits.length;

  return (
    <div className="search">
      <div className="search-head">
        <h1>Results for <span className="search-term">“{query}”</span></h1>
        <span className="tracks-meta">{total} {total === 1 ? "match" : "matches"} · restricted items are hidden from your role</span>
      </div>

      <div className="search-results wide">
        {total === 0 && <p className="muted">No matches. Try a track name, a file title, or an annotation.</p>}

        {trackHits.map((t) => (
          <button key={`t-${t.id}`} type="button" className="result" onClick={() => actions.go("category", { trackId: t.id })}>
            <div className="result-top">
              <span className="result-track">Track</span>
              <span className="result-loc">{t.file_count} files</span>
            </div>
            <span className="result-title">{t.title}</span>
            <span className="result-snippet">{t.description}</span>
          </button>
        ))}

        {fileHits.map(({ file, track }) => (
          <button key={`f-${file.id}`} type="button" className="result" onClick={() => actions.go("category", { trackId: track.id })}>
            <div className="result-top">
              <span className="result-track">{track.title}</span>
              <span className="result-loc">v{file.version} · {humanSize(file.size_bytes)}</span>
            </div>
            <span className="result-title">{file.title}</span>
            <span className="result-snippet">
              {file.annotation || `${file.status === "draft" ? "Draft" : "Published"} file in ${track.title}.`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
