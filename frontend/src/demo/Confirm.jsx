import { ROWS, TRACKS } from "./data.js";
import { Icon } from "./ui.jsx";

// Resolve the selected keys back to human labels for the confirmation list.
function selLabels(state) {
  const cat = TRACKS.find((t) => t.id === state.catId) || TRACKS[1];
  const base = (ROWS[cat.id] || []).map((r) => ({ key: cat.id + "/" + r.i, label: r.i + " · " + r.title }));
  const drafts = state.added.map((a, i) => ({ key: "new/" + i, label: "NEW · " + a.title }));
  const all = base.concat(drafts);
  return state.sel.map((k) => all.find((r) => r.key === k)?.label || k);
}

export default function Confirm({ state, actions }) {
  if (!state.confirmOpen) return null;
  const n = state.sel.length;
  const labels = selLabels(state);

  return (
    <div className="modal-scrim" onClick={actions.cancelDelete}>
      <div className="modal" role="alertdialog" aria-label="Confirm delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon danger"><Icon name="trash" size={20} /></div>
        <h2 className="modal-title">{n > 1 ? `Delete ${n} files?` : "Delete this file?"}</h2>
        <p className="modal-body">
          Readers lose access immediately. The deletion is recorded in the audit log with your
          name and the reason field from the recycle bin.
        </p>
        {labels.length > 0 && (
          <ul className="modal-list">
            {labels.slice(0, 5).map((l, i) => <li key={i}>{l}</li>)}
            {labels.length > 5 && <li className="modal-list-more">+{labels.length - 5} more</li>}
          </ul>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={actions.cancelDelete}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={actions.confirmDelete}>
            Move to recycle bin
          </button>
        </div>
      </div>
    </div>
  );
}
