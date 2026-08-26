export default function TrackGrid({ tracks, trackCount, fileCount, technicalTrack, canSeeTechnical, isEditor, onOpen }) {
  return (
    <div>
      <div className="tracks-section-head">
        <h2>Material tracks</h2>
        <span className="tracks-meta">
          {trackCount} track{trackCount === 1 ? "" : "s"} · {fileCount} file{fileCount === 1 ? "" : "s"}
        </span>
      </div>

      {isEditor && (
        <div className="editor-hint">
          <span className="tag">Editor</span>
          <span>Open any folder to add, delete or annotate its files — the tools sit above the file table.</span>
        </div>
      )}

      <div className="track-grid">
        {tracks.map((track, index) => {
          const published = track.published_count ?? 0;
          const downloaded = track.downloaded_count ?? 0;
          return (
            <button key={track.id} type="button" className="track-card" onClick={() => onOpen(track.id)}>
              <div className="track-card-top">
                <span className="track-card-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="track-card-rule" />
                <span className="track-card-count">
                  {track.file_count} file{track.file_count === 1 ? "" : "s"}
                </span>
              </div>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
              <div className="track-card-foot">
                {published > 0 && (
                  <span className="track-card-progress" title="Files you've downloaded from this track">
                    {downloaded}/{published} downloaded
                  </span>
                )}
                <span className="track-card-open">Open →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* The Technical Section is a track like any other, but the frontend
          never even renders it for a Student -- the file-level visibility
          rule is enforced server-side regardless, this is just so the
          card itself (and its file count) isn't shown to someone it
          isn't for. */}
      {canSeeTechnical && technicalTrack && (
        <button type="button" className="technical-section" onClick={() => onOpen(technicalTrack.id)}>
          <div className="technical-section-top">
            <span className="pill restricted">Restricted</span>
          </div>
          <h3>{technicalTrack.title}</h3>
          <p>{technicalTrack.description}</p>
          <span className="cta">Open Technical Section →</span>
        </button>
      )}
    </div>
  );
}
