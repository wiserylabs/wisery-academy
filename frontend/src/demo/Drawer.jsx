import { ROLES, TRACKS } from "./data.js";
import { Icon } from "./ui.jsx";

const VISIBILITIES = ["All roles", "Technical +", "Editors only"];

export default function Drawer({ state, actions }) {
  const drawer = state.drawer;
  if (!drawer) return null;

  const isAdd = drawer.kind === "add";
  const cat = TRACKS.find((t) => t.id === state.catId) || TRACKS[1];
  const me = ROLES[state.role];
  const existingNotes = !isAdd ? state.notes[drawer.keys[0]] || [] : [];

  const kicker = isAdd ? "Add to " + cat.title : "Annotations";
  const title = isAdd ? "Upload files" : drawer.label;
  const sub = isAdd
    ? "Files land as drafts in this folder. Nothing is downloadable until you publish."
    : "Notes appear on the row for every reader who can open the file.";
  const cta = isAdd ? "Upload as draft" : "Save annotation";
  const footNote = isAdd ? "Logged as " + me.name : "Visible to all readers of this folder";

  return (
    <>
      <div className="drawer-scrim" onClick={actions.closeDrawer} />
      <aside className="drawer" role="dialog" aria-label={title}>
        <div className="drawer-head">
          <div>
            <span className="drawer-kicker">{kicker}</span>
            <h2 className="drawer-title">{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={actions.closeDrawer} aria-label="Close">
            <Icon name="plus" size={18} className="rotated" />
          </button>
        </div>
        <p className="drawer-sub">{sub}</p>

        <div className="drawer-body">
          {isAdd ? (
            <>
              <div className="dropzone">
                <Icon name="plus" size={20} />
                <span>Drop files here or click to browse</span>
                <span className="dropzone-hint">PDF, PPTX, ZIP, CSV — up to 8 GB each</span>
              </div>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 11 — Advanced correlation"
                  value={state.draft.title}
                  onChange={(e) => actions.setDraft({ title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Version</label>
                <input
                  type="text"
                  placeholder="e.g. 2.4.3"
                  value={state.draft.version}
                  onChange={(e) => actions.setDraft({ version: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Visibility</label>
                <div className="topic-pills">
                  {VISIBILITIES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`topic-pill ${state.draft.visibility === v ? "active" : ""}`}
                      onClick={() => actions.setDraft({ visibility: v })}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {existingNotes.length > 0 && (
                <ul className="drawer-notes">
                  {existingNotes.map((n, i) => (
                    <li key={i} className="drawer-note">
                      <div className="drawer-note-top">
                        <span className="drawer-note-who">{n.who}</span>
                        <span className="drawer-note-when">{n.when}</span>
                      </div>
                      <span className="drawer-note-text">{n.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="field">
                <label>New annotation</label>
                <textarea
                  rows={4}
                  placeholder="Add context for readers of this file…"
                  value={state.draft.note}
                  onChange={(e) => actions.setDraft({ note: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <div className="drawer-foot">
          <span className="drawer-foot-note">{footNote}</span>
          <div className="drawer-foot-actions">
            <button type="button" className="btn btn-ghost" onClick={actions.closeDrawer}>Cancel</button>
            <button type="button" className="btn btn-solid" onClick={actions.commitDrawer}>{cta}</button>
          </div>
        </div>
      </aside>
    </>
  );
}
