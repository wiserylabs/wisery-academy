import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import TrackDetail from "./TrackDetail.jsx";
import TrackGrid from "./TrackGrid.jsx";

const ROLE_LABEL = {
  student: "Student — read and download, no Technical Section",
  technical: "Technical — read and download everything",
  editor: "Editor — add, delete and annotate all folders",
};

function initials(user) {
  const source = user.full_name || user.email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Portal({ user, onLogout }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .tracks()
      .then(setTracks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const materialTracks = tracks.filter((t) => t.slug !== "technical-section");
  const technicalTrack = tracks.find((t) => t.slug === "technical-section");
  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  const visibleTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materialTracks;
    return materialTracks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q)
    );
  }, [materialTracks, query]);

  const totalFileCount = materialTracks.reduce((sum, t) => sum + (t.file_count ?? 0), 0);

  function goHome() {
    setSelectedTrackId(null);
  }

  return (
    <div className="portal">
      <header className="portal-header">
        <div
          className="login-wordmark"
          onClick={goHome}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goHome()}
          role="button"
          tabIndex={0}
        >
          <span className="word">wisery</span>
          <span className="sub">Academy</span>
        </div>

        {!selectedTrack && (
          <div className="portal-search">
            <input
              type="search"
              placeholder="Search all materials…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search all materials"
            />
          </div>
        )}

        <div className="portal-header-user">
          <span className="portal-avatar">{initials(user)}</span>
          <div className="portal-header-identity">
            <span className="name">{user.full_name || user.email}</span>
            <span className="role">{ROLE_LABEL[user.role] ?? user.role}</span>
          </div>
          <button type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="portal-main">
        {error && <p className="error-banner">{error}</p>}

        {loading ? (
          <p className="muted">Loading material tracks…</p>
        ) : selectedTrack ? (
          <TrackDetail track={selectedTrack} user={user} onBack={goHome} />
        ) : (
          <TrackGrid
            tracks={visibleTracks}
            trackCount={materialTracks.length}
            fileCount={totalFileCount}
            technicalTrack={technicalTrack}
            canSeeTechnical={user.role !== "student"}
            isEditor={user.role === "editor"}
            onOpen={setSelectedTrackId}
          />
        )}
      </div>
    </div>
  );
}
