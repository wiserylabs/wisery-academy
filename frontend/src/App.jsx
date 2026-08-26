import { useEffect, useState } from "react";
import { api } from "./api.js";

const ROLE_LABEL = {
  student: "Student — read and download, no Technical Section",
  technical: "Technical — read and download everything",
  editor: "Editor — add, delete and annotate all folders",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      await api.login(email, password);
      const me = await api.me();
      setUser(me);
      setTracks(await api.tracks());
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    api.logout();
    setUser(null);
    setTracks([]);
  }

  if (!user) {
    return (
      <main style={{ maxWidth: 360, margin: "4rem auto", fontFamily: "system-ui, sans-serif" }}>
        <h1>wisery ACADEMY</h1>
        <p style={{ color: "#666" }}>Sign in to the portal.</p>
        <form onSubmit={handleLogin} style={{ display: "grid", gap: "0.6rem" }}>
          <input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Sign in</button>
        </form>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "2rem" }}>
          This is the Phase-0 wiring check — login, role, and the track list from
          the real API. The full interface from the design comes together in Phase 2.
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "3rem auto", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>wisery ACADEMY</h1>
        <button onClick={handleLogout}>Sign out</button>
      </header>
      <p>
        <strong>{user.full_name || user.email}</strong> — {ROLE_LABEL[user.role] || user.role}
      </p>
      <h2>Material tracks</h2>
      <ul>
        {tracks.map((t) => (
          <li key={t.id}>
            <strong>{t.title}</strong> — {t.file_count} file{t.file_count === 1 ? "" : "s"}
            <div style={{ color: "#666", fontSize: "0.9rem" }}>{t.description}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
