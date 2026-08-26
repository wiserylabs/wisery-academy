import { ITEMS, ROWS, SEED_ACTIVITY, TRACKS } from "./data.js";
import { Icon, StatusPill } from "./ui.jsx";

const FILTERS = ["All", "Recently updated", "Not started", "Downloaded"];

// Build the display rows for a track: any editor-added drafts first, then the
// seeded files, minus anything moved to the recycle bin, each annotated with
// its selection state and note count.
function buildRows(state) {
  const cat = TRACKS.find((t) => t.id === state.catId) || TRACKS[1];
  const drafts = state.added
    .filter((a) => a.cat === cat.id)
    .map((a, i) => ({
      i: "NEW", title: a.title, sub: "Uploaded by you · awaiting publish",
      st: "Draft", tone: "warning", v: a.version, size: "—", fmt: "PDF",
      isNew: true, key: "new/" + i,
    }));
  const base = (ROWS[cat.id] || []).map((r) => ({ ...r, key: cat.id + "/" + r.i }));
  const all = drafts.concat(base).filter((r) => !state.removed.includes(r.key));
  return { cat, rows: all };
}

function CategoryHeader({ cat, canEdit, manageMode, onToggleManage }) {
  return (
    <div className="cat-head">
      <div className="cat-head-main">
        <span className="cat-num">{cat.num}</span>
        <div>
          <span className="cat-kicker">{cat.kicker}</span>
          <h1 className="cat-title">{cat.title}</h1>
          <p className="cat-blurb">{cat.blurb}</p>
        </div>
      </div>
      <div className="cat-head-aside">
        <div className="cat-progress">
          <span className="cat-progress-label">{cat.progressLabel}</span>
          <span className="cat-progress-value">{cat.progressValue}</span>
          <div className="cat-progress-bar">
            <span style={{ width: cat.progressNum + "%" }} />
          </div>
        </div>
        {canEdit ? (
          <button
            type="button"
            className={`btn ${manageMode ? "btn-solid" : "btn-outline"}`}
            onClick={onToggleManage}
          >
            {manageMode ? "Done managing" : "Manage files"}
          </button>
        ) : (
          <button type="button" className="btn btn-outline">
            <Icon name="download" size={15} /> Download all ({cat.zipSize})
          </button>
        )}
      </div>
    </div>
  );
}

function FileRow({ cat, row, manageMode, state, actions, columns }) {
  const key = row.key;
  const notes = state.notes[key] || [];
  const noteLabel = notes.length ? (notes.length === 1 ? "1 note" : notes.length + " notes") : "";
  const checked = state.sel.includes(key);

  const open = () => {
    if (manageMode) { actions.toggleRow(key); return; }
    if (ITEMS[key]) actions.go("item", key);
    else actions.go("item", cat.id === "datasets" ? "datasets/01" : "labs/04");
  };

  return (
    <div
      className={`file-row ${checked ? "selected" : ""} ${row.isNew ? "is-new" : ""}`}
      style={{ gridTemplateColumns: columns }}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
    >
      {manageMode && (
        <span className="file-cell cell-check" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={checked} onChange={() => actions.toggleRow(key)} aria-label={`Select ${row.title}`} />
        </span>
      )}
      <span className="file-cell cell-index">{row.i}</span>
      <span className="file-cell cell-title">
        <span className="file-title">{row.title}</span>
        <span className="file-sub">
          {row.sub}
          {row.video && <span className="file-video"> · <Icon name="play" size={11} /> {row.video}</span>}
        </span>
        {noteLabel && <span className="file-note">✎ {noteLabel} — {notes[notes.length - 1].text}</span>}
      </span>
      <span className="file-cell cell-status"><StatusPill label={row.st} tone={row.tone} /></span>
      <span className="file-cell cell-version mono">{row.v}</span>
      <span className="file-cell cell-size mono">{row.size}</span>
      {manageMode ? (
        <span className="file-cell cell-actions" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="icon-btn sm" title="Annotate" onClick={() => actions.openNote([key], row.title)}>
            <Icon name="pencil" size={15} />
          </button>
          <button type="button" className="icon-btn sm danger" title="Delete" onClick={() => actions.askDelete([key])}>
            <Icon name="trash" size={15} />
          </button>
        </span>
      ) : (
        <span className="file-cell cell-download" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="dl-btn">{row.fmt}<Icon name="download" size={13} /></button>
        </span>
      )}
    </div>
  );
}

function ActivityLog() {
  const color = { added: "act-added", deleted: "act-deleted", annotated: "act-note", replaced: "act-note" };
  return (
    <aside className="activity">
      <span className="panel-kicker">Recent activity</span>
      <ul className="activity-list">
        {SEED_ACTIVITY.map((a, i) => (
          <li key={i} className="activity-item">
            <span className={`activity-dot ${color[a.kind] || ""}`} />
            <span className="activity-body">
              <span className="activity-text">{a.text}</span>
              <span className="activity-when">{a.when}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function Category({ state, actions }) {
  const { cat, rows } = buildRows(state);
  const canEdit = state.role === "editor";
  const manageMode = canEdit && state.manage;
  const rowKeys = rows.map((r) => r.key);
  const columns = manageMode
    ? "28px 56px 1fr 150px 96px 84px 116px"
    : "56px 1fr 150px 96px 84px 96px";
  const allChecked = rowKeys.length > 0 && state.sel.length === rowKeys.length;

  return (
    <div className="category">
      <button type="button" className="back-link" onClick={() => actions.go("home")}>
        <Icon name="back" size={15} /> All materials
      </button>

      <CategoryHeader
        cat={cat}
        canEdit={canEdit}
        manageMode={manageMode}
        onToggleManage={actions.toggleManage}
      />

      <div className="cat-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-tab ${state.filter === f ? "active" : ""}`}
              onClick={() => actions.setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="cat-toolbar-right">
          <span className="row-count">{rows.length} items · newest first</span>
          {manageMode && (
            <button type="button" className="btn btn-solid sm" onClick={actions.openAdd}>
              <Icon name="plus" size={15} /> Add files
            </button>
          )}
        </div>
      </div>

      {manageMode && state.sel.length > 0 && (
        <div className="selection-bar">
          <span className="selection-count">
            {state.sel.length} {state.sel.length === 1 ? "file" : "files"} selected
          </span>
          <div className="selection-actions">
            <button type="button" className="btn btn-ghost sm" onClick={() => actions.openNote(state.sel, state.sel.length + " files")}>
              <Icon name="pencil" size={14} /> Annotate
            </button>
            <button type="button" className="btn btn-ghost sm danger" onClick={() => actions.askDelete()}>
              <Icon name="trash" size={14} /> Delete
            </button>
            <button type="button" className="btn btn-ghost sm" onClick={actions.clearSelection}>Clear</button>
          </div>
        </div>
      )}

      <div className={`file-table ${manageMode ? "manage" : ""}`}>
        <div className="file-head" style={{ gridTemplateColumns: columns }}>
          {manageMode && (
            <span className="file-cell cell-check">
              <input type="checkbox" checked={allChecked} onChange={() => actions.selectAll(rowKeys)} aria-label="Select all" />
            </span>
          )}
          <span className="file-cell">{cat.colIndex}</span>
          <span className="file-cell">Title</span>
          <span className="file-cell">{cat.colExtra}</span>
          <span className="file-cell">Version</span>
          <span className="file-cell">Size</span>
          <span className="file-cell">{manageMode ? "Actions" : "Download"}</span>
        </div>
        {rows.map((row) => (
          <FileRow
            key={row.key}
            cat={cat}
            row={row}
            manageMode={manageMode}
            state={state}
            actions={actions}
            columns={columns}
          />
        ))}
      </div>

      <div className="cat-foot">
        <span>{cat.footNote}</span>
        <span className="cat-foot-right">
          {manageMode
            ? "Editor mode · changes are versioned and reversible for 30 days"
            : "Mirrored on the internal file server · SHA-256 manifest included"}
        </span>
      </div>

      {manageMode && <ActivityLog />}
    </div>
  );
}
