import { useState } from "react";
import { Icon } from "../demo/ui.jsx";

const MAX_BYTES = 8 * 1024 * 1024 * 1024; // 8 GB
const VISIBILITIES = [
  ["all", "All roles"],
  ["technical_plus", "Technical +"],
  ["editors_only", "Editors only"],
];

export default function FileDrawer({ modal, tracks, actions }) {
  const isEdit = modal.kind === "edit";
  const file = modal.file;
  const track = tracks.find((t) => t.id === (isEdit ? file.track : modal.trackId));

  const [title, setTitle] = useState(file?.title ?? "");
  const [version, setVersion] = useState(file?.version ?? "1.0");
  const [visibility, setVisibility] = useState(file?.visibility ?? "all");
  const [annotation, setAnnotation] = useState(file?.annotation ?? "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function pickFile(f) {
    if (!f) return;
    if (f.size > MAX_BYTES) { setError("That file is over the 8 GB limit."); return; }
    setError("");
    setSelectedFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer?.files?.[0];
    pickFile(dropped);
  }

  async function submit() {
    setError("");
    if (!isEdit && !selectedFile) { setError("Choose a file to upload."); return; }
    if (selectedFile && selectedFile.size > MAX_BYTES) { setError("That file is over the 8 GB limit."); return; }
    setBusy(true);
    try {
      if (isEdit) {
        await actions.updateFile(file, { title, version, visibility, annotation });
      } else {
        await actions.upload(track.id, { title, version, visibility, annotation, file: selectedFile });
      }
      actions.closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="drawer-scrim" onClick={actions.closeModal} />
      <aside className="drawer" role="dialog" aria-label={isEdit ? "Edit file" : "Upload files"}>
        <div className="drawer-head">
          <div>
            <span className="drawer-kicker">{isEdit ? "Edit" : `Add to ${track?.title ?? "folder"}`}</span>
            <h2 className="drawer-title">{isEdit ? file.title : "Upload a file"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={actions.closeModal} aria-label="Close">
            <Icon name="plus" size={18} className="rotated" />
          </button>
        </div>
        <p className="drawer-sub">
          {isEdit
            ? "Changes are versioned and written to the audit log. Annotations show on the row for every reader."
            : "The file is scanned and checksummed, then lands as a draft. Nothing is downloadable until you publish."}
        </p>

        <div className="drawer-body">
          {!isEdit && (
            <label
              className={`dropzone ${dragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
              onDrop={onDrop}
            >
              <Icon name={selectedFile ? "check" : "plus"} size={20} />
              <span>{selectedFile ? selectedFile.name : dragging ? "Drop the file to attach it" : "Drag & drop a file here, or click to browse"}</span>
              <span className="dropzone-hint">
                {selectedFile ? "Click to choose a different file" : "PDF, PPTX, MP4, CSV, ZIP — up to 8 GB"}
              </span>
              <input type="file" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files[0])} />
            </label>
          )}
          <div className="field">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lab 11 — Advanced correlation" />
          </div>
          <div className="field">
            <label>Version</label>
            <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 2.4.3" />
          </div>
          <div className="field">
            <label>Visibility</label>
            <div className="topic-pills">
              {VISIBILITIES.map(([value, label]) => (
                <button key={value} type="button" className={`topic-pill ${visibility === value ? "active" : ""}`} onClick={() => setVisibility(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Annotation</label>
            <textarea rows={3} value={annotation} onChange={(e) => setAnnotation(e.target.value)} placeholder="Optional note shown to readers of this file…" />
          </div>
          {error && <p className="error-banner">{error}</p>}
        </div>

        <div className="drawer-foot">
          <span className="drawer-foot-note">Logged as the signed-in editor</span>
          <div className="drawer-foot-actions">
            <button type="button" className="btn btn-ghost" onClick={actions.closeModal}>Cancel</button>
            <button type="button" className="btn btn-solid" onClick={submit} disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save changes" : "Upload as draft"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
