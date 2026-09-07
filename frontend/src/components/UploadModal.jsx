import { useState } from "react";
import { api } from "../api.js";

const MAX_BYTES = 8 * 1024 * 1024 * 1024; // 8 GB, matches the upload modal's own copy

const VISIBILITY_OPTIONS = [
  ["all", "All roles"],
  ["technical_plus", "Technical +"],
  ["editors_only", "Editors only"],
];

export default function UploadModal({ track, file, onClose, onSaved }) {
  const isEdit = Boolean(file);
  const [title, setTitle] = useState(file?.title ?? "");
  const [version, setVersion] = useState(file?.version ?? "1.0");
  const [visibility, setVisibility] = useState(file?.visibility ?? "all");
  const [annotation, setAnnotation] = useState(file?.annotation ?? "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isEdit && !selectedFile) {
      setError("Choose a file to upload.");
      return;
    }
    if (selectedFile && selectedFile.size > MAX_BYTES) {
      setError("That file is over the 8 GB limit.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.updateFile(file.id, { title, version, visibility, annotation });
      } else {
        await api.uploadFile({
          track: track.id,
          title,
          version,
          visibility,
          annotation,
          file: selectedFile,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3>{isEdit ? `Edit "${file.title}"` : `Add to ${track.title}`}</h3>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!isEdit && (
          <>
            <label className="dropzone">
              {selectedFile ? selectedFile.name : "Drop a file here, or browse"}
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0] ?? null)}
                style={{ display: "none" }}
              />
            </label>
            <p className="muted small">PDF · PPTX · MP4 · CSV · ZIP · up to 8 GB per file</p>
          </>
        )}

        <label className="field">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label className="field">
          Version
          <input value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>

        <fieldset className="field">
          <legend>Who can see it</legend>
          {VISIBILITY_OPTIONS.map(([value, label]) => (
            <label key={value} className="radio-option">
              <input
                type="radio"
                name="visibility"
                value={value}
                checked={visibility === value}
                onChange={() => setVisibility(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <label className="field">
          Annotation (optional)
          <textarea value={annotation} onChange={(e) => setAnnotation(e.target.value)} rows={2} />
        </label>

        {!isEdit && (
          <p className="muted small">
            The file is scanned and a SHA-256 checksum is generated before it becomes downloadable.
            It stays in Draft until you publish.
          </p>
        )}

        {error && <p className="error-banner">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Upload as draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
