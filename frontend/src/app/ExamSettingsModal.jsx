import { useState } from "react";
import { Icon } from "../demo/ui.jsx";

// Editor-only: set the certification-exam window (open/close dates) and which
// material library the "Certification exam" link opens when it's live.
export default function ExamSettingsModal({ settings, tracks, actions, onClose }) {
  const [opens, setOpens] = useState(settings?.exam_opens_at || "");
  const [closes, setCloses] = useState(settings?.exam_closes_at || "");
  const [trackId, setTrackId] = useState(settings?.exam_track || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setError("");
    if (opens && closes && closes < opens) {
      setError("The close date must be on or after the open date.");
      return;
    }
    setBusy(true);
    try {
      await actions.updateSettings({
        exam_opens_at: opens || null,
        exam_closes_at: closes || null,
        exam_track: trackId || null,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal exam-modal" role="dialog" aria-label="Certification exam settings" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Certification exam</h2>
        <p className="modal-body">
          Set the window when the exam is available. While it's open, the “Certification exam”
          line on the home panel links readers to the library you choose here.
        </p>

        <div className="field-row">
          <div className="field">
            <label>Opens</label>
            <input type="date" value={opens} onChange={(e) => setOpens(e.target.value)} />
          </div>
          <div className="field">
            <label>Closes</label>
            <input type="date" value={closes} onChange={(e) => setCloses(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Exam library</label>
          <select value={trackId} onChange={(e) => setTrackId(e.target.value)}>
            <option value="">— none —</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-solid" onClick={save} disabled={busy}>
            {busy ? "Saving…" : <><Icon name="check" size={15} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}
