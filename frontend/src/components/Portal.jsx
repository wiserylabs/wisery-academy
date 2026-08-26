import { useEffect, useState } from "react";
import { api } from "../api.js";
import TrackDetail from "./TrackDetail.jsx";
import TrackGrid from "./TrackGrid.jsx";

const ROLE_LABEL = {
  student: "Student — read and download, no Technical Section",
  technical: "Technical — read and download everything",
  editor: "Editor — add, delete and annotate all folders",
};

export default function Portal({ user, onLogout }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);

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

  return (
    <div className="portal">
      <header className="portal-header">
        <h1>wisery ACADEMY</h1>
        <div className="portal-header-user">
          <span>
            <strong>{user.full_name || user.email}</strong> — {ROLE_LABEL[user.role] ?? user.role}
          </span>
          <button type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading material tracks…</p>
      ) : selectedTrack ? (
        <TrackDetail track={selectedTrack} user={user} onBack={() => setSelectedTrackId(null)} />
      ) : (
        <TrackGrid
          tracks={materialTracks}
          technicalTrack={technicalTrack}
          canSeeTechnical={user.role !== "student"}
          onOpen={setSelectedTrackId}
        />
      )}
    </div>
  );
}
