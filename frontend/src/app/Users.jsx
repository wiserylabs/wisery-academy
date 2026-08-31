import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../demo/ui.jsx";

const ROLES = ["student", "technical", "editor"];
const BLANK = { email: "", full_name: "", role: "student", password: "" };

export default function Users({ currentUser, actions }) {
  const [users, setUsers] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [newUser, setNewUser] = useState(BLANK);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");

  async function load() {
    setLoading(true);
    try {
      const list = await api.users();
      setUsers(list);
      setEdits(Object.fromEntries(
        list.map((u) => [u.id, { email: u.email, full_name: u.full_name || "", role: u.role, password: "" }])
      ));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const setEdit = (id, patch) => setEdits((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const dirty = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const e = edits[u.id];
      if (!e) return;
      map[u.id] = e.email !== u.email || e.full_name !== (u.full_name || "") || e.role !== u.role || !!e.password;
    });
    return map;
  }, [users, edits]);

  async function save(u) {
    const e = edits[u.id];
    setBusyId(u.id);
    try {
      const fields = { email: e.email, full_name: e.full_name, role: e.role };
      if (e.password) fields.password = e.password;
      await api.updateUser(u.id, fields);
      actions.flash(`Saved ${e.email}.`);
      await load();
    } catch (err) {
      actions.flash(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(u) {
    setBusyId(u.id);
    try {
      await api.deleteUser(u.id);
      setConfirmId(null);
      actions.flash(`Deleted ${u.email}.`);
      await load();
    } catch (err) {
      actions.flash(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function create() {
    setCreateErr("");
    if (!newUser.email.trim()) { setCreateErr("Email is required."); return; }
    if (newUser.password.length < 8) { setCreateErr("Password must be at least 8 characters."); return; }
    setCreating(true);
    try {
      await api.createUser(newUser);
      actions.flash(`Created ${newUser.email}.`);
      setNewUser(BLANK);
      await load();
    } catch (err) {
      setCreateErr(err.message);
    } finally {
      setCreating(false);
    }
  }

  const columns = "1.3fr 1.1fr 130px 160px 132px";

  return (
    <div className="users">
      <div className="page-head">
        <span className="page-kicker">Editors only</span>
        <h1>User management</h1>
        <p>
          Add people, change roles, and reset passwords. Passwords are stored hashed and can’t be
          shown — leave the field blank to keep the current one, or type a new one to reset it.
        </p>
      </div>

      <div className="user-create">
        <h2>Add a user</h2>
        <div className="user-create-grid">
          <div className="field">
            <label>Email (username)</label>
            <input type="text" placeholder="name@organisation.gov" value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Full name</label>
            <input type="text" placeholder="Full name" value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="At least 8 characters" value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          </div>
          <button type="button" className="btn btn-solid" onClick={create} disabled={creating}>
            <Icon name="plus" size={15} /> {creating ? "Adding…" : "Add user"}
          </button>
        </div>
        {createErr && <p className="error-banner">{createErr}</p>}
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="users-table">
        <div className="user-head" style={{ gridTemplateColumns: columns }}>
          <span>Username (email)</span>
          <span>Full name</span>
          <span>Role</span>
          <span>Password</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="file-empty">Loading users…</div>
        ) : (
          users.map((u) => {
            const e = edits[u.id] || {};
            const isSelf = currentUser && u.id === currentUser.id;
            return (
              <div key={u.id} className="user-row" style={{ gridTemplateColumns: columns }}>
                <span className="user-cell">
                  <input type="text" value={e.email ?? ""} onChange={(ev) => setEdit(u.id, { email: ev.target.value })} />
                  {isSelf && <span className="user-you">you</span>}
                </span>
                <span className="user-cell">
                  <input type="text" value={e.full_name ?? ""} onChange={(ev) => setEdit(u.id, { full_name: ev.target.value })} />
                </span>
                <span className="user-cell">
                  <select value={e.role} disabled={isSelf} title={isSelf ? "You can't change your own role" : ""}
                    onChange={(ev) => setEdit(u.id, { role: ev.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </span>
                <span className="user-cell">
                  <input type="password" placeholder="Unchanged" value={e.password ?? ""}
                    onChange={(ev) => setEdit(u.id, { password: ev.target.value })} />
                </span>
                <span className="user-cell user-actions">
                  <button type="button" className="btn btn-solid sm" disabled={!dirty[u.id] || busyId === u.id} onClick={() => save(u)}>
                    Save
                  </button>
                  {confirmId === u.id ? (
                    <>
                      <button type="button" className="btn btn-danger sm" disabled={busyId === u.id} onClick={() => remove(u)}>Yes</button>
                      <button type="button" className="btn btn-ghost sm" onClick={() => setConfirmId(null)}>No</button>
                    </>
                  ) : (
                    <button type="button" className="icon-btn sm danger" disabled={isSelf} title={isSelf ? "You can't delete yourself" : "Delete user"}
                      onClick={() => setConfirmId(u.id)}>
                      <Icon name="trash" size={15} />
                    </button>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
