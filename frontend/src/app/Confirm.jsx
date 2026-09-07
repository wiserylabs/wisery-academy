import { Icon } from "../demo/ui.jsx";

export default function Confirm({ confirm, actions }) {
  const file = confirm.file;
  return (
    <div className="modal-scrim" onClick={actions.cancelDelete}>
      <div className="modal" role="alertdialog" aria-label="Confirm delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon danger"><Icon name="trash" size={20} /></div>
        <h2 className="modal-title">Delete this file?</h2>
        <p className="modal-body">
          Readers lose access immediately. The deletion is recorded in the audit log with your
          name — this cannot be undone from here.
        </p>
        <ul className="modal-list">
          <li>{file.title} · v{file.version}</li>
        </ul>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={actions.cancelDelete}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={actions.confirmDelete}>Delete file</button>
        </div>
      </div>
    </div>
  );
}
