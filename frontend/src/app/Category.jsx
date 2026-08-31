import { useMemo, useState } from "react";
import { Icon, StatusPill } from "../demo/ui.jsx";
import { VISIBILITY_LABEL, formatBadge, humanSize } from "./format.js";

const FILTERS = ["All", "Recently updated", "Not started", "Downloaded"];
const RECENT_MS = 45 * 24 * 60 * 60 * 1000;

function applyFilter(files, filter) {
  switch (filter) {
    case "Downloaded":
      return files.filter((f) => f.downloaded);
    case "Not started":
      return files.filter((f) => f.status === "published" && !f.downloaded);
    case "Recently updated":
      return [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter((f) => Date.now() - new Date(f.published_at || f.created_at).getTime() < RECENT_MS);
    default:
      return files;
  }
}

function FileRow({ file, index, manageMode, columns, actions }) {
  const isDraft = file.status === "draft";
  const open = () => { if (!manageMode) actions.download(file); };

  return (
    <div
      className={`file-row ${isDraft ? "is-new" : ""}`}
      style={{ gridTemplateColumns: columns }}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
    >
      <span className="file-cell cell-index">{isDraft ? "NEW" : String(index + 1).padStart(2, "0")}</span>
      <span className="file-cell cell-title">
        <span className="file-title">{file.title}</span>
        <span className="file-sub">
          {file.visibility !== "all" && <span className="file-vis">{VISIBILITY_LABEL[file.visibility]}</span>}
          {file.visibility !== "all" && (file.annotation || file.downloaded) && " · "}
          {file.downloaded && !file.annotation && "Downloaded"}
          {file.annotation && <span className="file-note-inline">✎ {file.annotation}</span>}
          {!file.annotation && !file.downloaded && file.visibility === "all" && (isDraft ? "Awaiting publish" : "Ready to download")}
        </span>
      </span>
      <span className="file-cell cell-status">
        <StatusPill label={isDraft ? "Draft" : "Published"} tone={isDraft ? "warning" : "success"} />
        {file.downloaded && <Icon name="check" size={13} className="downloaded-check" />}
      </span>
      <span className="file-cell cell-version mono">{file.version}</span>
      <span className="file-cell cell-size mono">{humanSize(file.size_bytes)}</span>
      {manageMode ? (
        <span className="file-cell cell-actions" onClick={(e) => e.stopPropagation()}>
          {isDraft && (
            <button type="button" className="icon-btn sm" title="Publish" onClick={() => actions.publish(file)}>
              <Icon name="check" size={15} />
            </button>
          )}
          <button type="button" className="icon-btn sm" title="Edit / annotate" onClick={() => actions.openEdit(file)}>
            <Icon name="pencil" size={15} />
          </button>
          <button type="button" className="icon-btn sm danger" title="Delete" onClick={() => actions.askDelete(file)}>
            <Icon name="trash" size={15} />
          </button>
        </span>
      ) : (
        <span className="file-cell cell-download" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="dl-btn" onClick={() => actions.download(file)}>
            {formatBadge(file)}<Icon name="download" size={13} />
          </button>
        </span>
      )}
    </div>
  );
}

export default function Category({ track, files, loadingFiles, role, actions }) {
  const [filter, setFilter] = useState("All");
  const [manage, setManage] = useState(false);
  const canEdit = role === "editor";
  const manageMode = canEdit && manage;
  const restricted = track.slug === "technical-section";

  const visible = useMemo(() => applyFilter(files || [], filter), [files, filter]);
  const num = String(track.sort_order || 0).padStart(2, "0");
  const total = track.published_count || 0;
  const done = track.downloaded_count || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const columns = manageMode
    ? "56px 1fr 150px 96px 84px 120px"
    : "56px 1fr 150px 96px 84px 96px";

  return (
    <div className="category">
      <button type="button" className="back-link" onClick={() => actions.go("home")}>
        <Icon name="back" size={15} /> All materials
      </button>

      {restricted && (
        <div className="restricted-banner">
          <Icon name="lock" size={15} /> Restricted folder — access is logged. Files here are limited to Technical and Editor roles.
        </div>
      )}

      <div className="cat-head">
        <div className="cat-head-main">
          <span className="cat-num">{num}</span>
          <div>
            <span className="cat-kicker">Track {num}</span>
            <h1 className="cat-title">{track.title}</h1>
            <p className="cat-blurb">{track.description}</p>
          </div>
        </div>
        <div className="cat-head-aside">
          <div className="cat-progress">
            <span className="cat-progress-label">Downloaded</span>
            <span className="cat-progress-value">{done} / {total}</span>
            <div className="cat-progress-bar"><span style={{ width: `${pct}%` }} /></div>
          </div>
          {canEdit ? (
            <button type="button" className={`btn ${manageMode ? "btn-solid" : "btn-outline"}`} onClick={() => setManage(!manage)}>
              {manageMode ? "Done managing" : "Manage files"}
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={() => actions.flash("Bundle download isn’t wired in this build — download files individually.")}>
              <Icon name="download" size={15} /> Download all
            </button>
          )}
        </div>
      </div>

      <div className="cat-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="cat-toolbar-right">
          <span className="row-count">{visible.length} items · newest first</span>
          {manageMode && (
            <button type="button" className="btn btn-solid sm" onClick={() => actions.openUpload(track.id)}>
              <Icon name="plus" size={15} /> Add files
            </button>
          )}
        </div>
      </div>

      <div className="file-table">
        <div className="file-head" style={{ gridTemplateColumns: columns }}>
          <span className="file-cell">#</span>
          <span className="file-cell">Title</span>
          <span className="file-cell">Status</span>
          <span className="file-cell">Version</span>
          <span className="file-cell">Size</span>
          <span className="file-cell">{manageMode ? "Actions" : "Download"}</span>
        </div>
        {loadingFiles && !files ? (
          <div className="file-empty">Loading files…</div>
        ) : visible.length === 0 ? (
          <div className="file-empty">No files here yet.</div>
        ) : (
          visible.map((file, i) => (
            <FileRow key={file.id} file={file} index={i} manageMode={manageMode} columns={columns} actions={actions} />
          ))
        )}
      </div>

      <div className="cat-foot">
        <span>{restricted ? "Access to this folder is recorded in the audit log." : "Mirrored on the internal file server · SHA-256 manifest included"}</span>
        <span className="cat-foot-right">
          {manageMode ? "Editor mode · every action is written to the audit log" : `${track.file_count} files in this track`}
        </span>
      </div>
    </div>
  );
}
