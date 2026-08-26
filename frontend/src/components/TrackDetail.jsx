import { useEffect, useState } from "react";
import { api } from "../api.js";
import { StatusPill, VisibilityPill, formatSize } from "./Pills.jsx";
import UploadModal from "./UploadModal.jsx";

export default function TrackDetail({ track, user, onBack }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [manageMode, setManageMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const isEditor = user.role === "editor";

  async function loadFiles() {
    setLoading(true);
    try {
      setFiles(await api.files(track.id));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  async function handlePublish(file) {
    setBusyId(file.id);
    try {
      await api.publishFile(file.id);
      await loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(file) {
    if (!window.confirm(`Delete "${file.title}"? This can't be undone.`)) return;
    setBusyId(file.id);
    try {
      await api.deleteFile(file.id);
      await loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function handleDownloadClick(file) {
    // Best-effort: the download itself happens via the href, this just
    // records progress. Never block or fail the download on it.
    api.markDownloaded(file.id).catch(() => {});
  }

  function openAddModal() {
    setEditingFile(null);
    setModalOpen(true);
  }

  function openEditModal(file) {
    setEditingFile(file);
    setModalOpen(true);
  }

  return (
    <div className="track-detail">
      <button type="button" className="link-button" onClick={onBack}>
        ← All materials
      </button>
      <h2>{track.title}</h2>
      {track.description && <p className="muted">{track.description}</p>}

      {isEditor && (
        <div className="manage-bar">
          <p className="muted small">
            Open any folder to add, delete or annotate its files — the tools sit above the file table.
          </p>
          <div className="manage-actions">
            <button type="button" onClick={() => setManageMode((m) => !m)}>
              {manageMode ? "Done managing" : "Manage files"}
            </button>
            <button type="button" className="primary" onClick={openAddModal}>
              + Add files
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading files…</p>
      ) : files.length === 0 ? (
        <p className="muted">No files yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="file-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Version</th>
                {isEditor && <th>Status</th>}
                {isEditor && <th>Visibility</th>}
                <th>Size</th>
                <th />
                {manageMode && <th />}
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <strong>{file.title}</strong>
                    {file.annotation && <div className="annotation">{file.annotation}</div>}
                  </td>
                  <td>{file.version}</td>
                  {isEditor && (
                    <td>
                      <StatusPill status={file.status} />
                    </td>
                  )}
                  {isEditor && (
                    <td>
                      <VisibilityPill visibility={file.visibility} />
                    </td>
                  )}
                  <td>{formatSize(file.size_bytes)}</td>
                  <td>
                    {file.download_url ? (
                      <a
                        href={file.download_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleDownloadClick(file)}
                      >
                        Download
                      </a>
                    ) : (
                      <span className="muted">Not published</span>
                    )}
                  </td>
                  {manageMode && (
                    <td className="row-actions">
                      {file.status === "draft" && (
                        <button type="button" disabled={busyId === file.id} onClick={() => handlePublish(file)}>
                          Publish
                        </button>
                      )}
                      <button type="button" disabled={busyId === file.id} onClick={() => openEditModal(file)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={busyId === file.id}
                        onClick={() => handleDelete(file)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <UploadModal
          track={track}
          file={editingFile}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadFiles();
          }}
        />
      )}
    </div>
  );
}
