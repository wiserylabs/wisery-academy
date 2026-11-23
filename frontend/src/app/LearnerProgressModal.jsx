import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../demo/ui.jsx";
import { ROLE_SHORT, formatDate } from "./format.js";

// Editor-only: a learner's must-read checklist. Ticking an item marks it
// completed for that learner -- the only thing that counts toward their
// progress (downloading alone does not).
export default function LearnerProgressModal({ learner, actions, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyFile, setBusyFile] = useState(null);

  useEffect(() => {
    api.learnerProgress(learner.id).then(setData).catch((e) => setError(e.message));
  }, [learner.id]);

  async function toggle(item) {
    setBusyFile(item.file);
    try {
      setData(await api.setLearnerCompletion(learner.id, item.file, !item.completed));
    } catch (e) {
      actions.flash(e.message);
    } finally {
      setBusyFile(null);
    }
  }

  const groups = [];
  (data?.items || []).forEach((item) => {
    const last = groups[groups.length - 1];
    if (last && last.title === item.track_title) last.items.push(item);
    else groups.push({ title: item.track_title, items: [item] });
  });
  const pct = data?.total ? Math.round((data.completed / data.total) * 100) : 0;
  const name = learner.full_name || learner.email;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal learner-modal" role="dialog" aria-label={`${name} progress`} onClick={(e) => e.stopPropagation()}>
        <div className="learner-head">
          <div>
            <h2 className="modal-title">{name}</h2>
            <span className="learner-sub">{ROLE_SHORT[learner.role] || learner.role} · {learner.email}</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="plus" size={18} className="rotated" />
          </button>
        </div>

        <p className="modal-body">
          Tick an item to mark it <strong>completed</strong> for this learner. Only completed must-read
          items count toward their progress.
        </p>

        {error && <p className="error-banner">{error}</p>}
        {!data && !error && <p className="muted">Loading…</p>}

        {data && (
          <>
            <div className="learner-summary">
              <span><strong>{data.completed}</strong> of {data.total} must-read items completed</span>
              <span className="learner-pct">{pct}%</span>
            </div>
            <div className="cat-progress-bar learner-bar"><span style={{ width: `${pct}%` }} /></div>

            {data.total === 0 ? (
              <p className="muted">No must-read items are visible to this learner yet.</p>
            ) : (
              <div className="learner-list">
                {groups.map((g) => (
                  <div key={g.title} className="learner-group">
                    <span className="panel-kicker">{g.title}</span>
                    {g.items.map((item) => (
                      <label key={item.file} className={`learner-item ${item.completed ? "done" : ""}`}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled={busyFile === item.file}
                          onChange={() => toggle(item)}
                          aria-label={`Mark ${item.title} completed`}
                        />
                        <span className="learner-item-body">
                          <span className="learner-item-title">{item.title}</span>
                          <span className="learner-item-meta">
                            v{item.version}
                            {item.downloaded && " · downloaded"}
                            {item.completed && item.completed_at &&
                              ` · completed ${formatDate(item.completed_at)}${item.completed_by ? ` by ${item.completed_by}` : ""}`}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-solid" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
