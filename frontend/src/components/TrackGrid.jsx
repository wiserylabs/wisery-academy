export default function TrackGrid({ tracks, technicalTrack, canSeeTechnical, onOpen }) {
  return (
    <div>
      <h2>Material tracks</h2>
      <div className="track-grid">
        {tracks.map((track) => (
          <button key={track.id} type="button" className="track-card" onClick={() => onOpen(track.id)}>
            <span className="track-card-count">
              {track.file_count} file{track.file_count === 1 ? "" : "s"}
            </span>
            <h3>{track.title}</h3>
            <p>{track.description}</p>
          </button>
        ))}
      </div>

      {/* The Technical Section is a track like any other, but the frontend
          never even renders it for a Student -- the file-level visibility
          rule is enforced server-side regardless, this is just so the
          card itself (and its file count) isn't shown to someone it
          isn't for. */}
      {canSeeTechnical && technicalTrack && (
        <div className="technical-section">
          <span className="pill restricted">Restricted</span>
          <h3>{technicalTrack.title}</h3>
          <p>{technicalTrack.description}</p>
          <button type="button" onClick={() => onOpen(technicalTrack.id)}>
            Open Technical Section →
          </button>
        </div>
      )}
    </div>
  );
}
