import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./format.js";

// The connected portal's single source of truth: authentication, the track /
// file data pulled from the Django API, the editor mutations (upload, edit,
// publish, delete, download) and the small bits of UI state (route, modal,
// toast). Everything that touches the server lives here.
export function useApp() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [tracks, setTracks] = useState([]);
  const [tracksError, setTracksError] = useState("");
  const [filesByTrack, setFilesByTrack] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [route, setRoute] = useState({ name: "home" });
  const [modal, setModal] = useState(null); // {kind:'upload',trackId} | {kind:'edit',file}
  const [confirm, setConfirm] = useState(null); // {file}
  const [toast, setToast] = useState("");

  const toastToken = useRef(0);
  const flash = useCallback((msg) => {
    toastToken.current += 1;
    const mine = toastToken.current;
    setToast(msg);
    setTimeout(() => { if (toastToken.current === mine) setToast(""); }, 2800);
  }, []);

  const loadTracks = useCallback(async () => {
    try {
      setTracks(await api.tracks());
      setTracksError("");
    } catch (err) {
      setTracksError(err.message);
    }
  }, []);

  const loadFiles = useCallback(async (trackId) => {
    if (!trackId) return;
    setLoadingFiles(true);
    try {
      const files = await api.files(trackId);
      setFilesByTrack((m) => ({ ...m, [trackId]: files }));
    } catch (err) {
      setFilesByTrack((m) => ({ ...m, [trackId]: [] }));
      flash(err.message);
    } finally {
      setLoadingFiles(false);
    }
  }, [flash]);

  // Load tracks whenever the signed-in user changes (login or role switch).
  useEffect(() => {
    if (user) loadTracks();
    else { setTracks([]); setFilesByTrack({}); }
  }, [user, loadTracks]);

  // ── Auth ──
  const finishLogin = useCallback(async (email, password) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      await api.login(email, password);
      const me = await api.me();
      setUser(me);
      setRoute({ name: "home" });
      window.scrollTo(0, 0);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const login = useCallback((email, password) => finishLogin(email, password), [finishLogin]);
  const loginAs = useCallback((role) => {
    const acct = DEMO_ACCOUNTS[role];
    if (acct) finishLogin(acct.email, DEMO_PASSWORD);
  }, [finishLogin]);
  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setRoute({ name: "home" });
  }, []);

  // ── Routing ──
  const go = useCallback((name, extra = {}) => {
    setRoute({ name, ...extra });
    window.scrollTo(0, 0);
    if ((name === "category" || name === "technical") && extra.trackId) loadFiles(extra.trackId);
  }, [loadFiles]);

  // ── Editor mutations ──
  const refresh = useCallback(async (trackId) => {
    await Promise.all([loadTracks(), trackId ? loadFiles(trackId) : Promise.resolve()]);
  }, [loadTracks, loadFiles]);

  const upload = useCallback(async (trackId, fields) => {
    await api.uploadFile({ track: trackId, ...fields });
    await refresh(trackId);
    flash(`“${fields.title}” uploaded as a draft — publish to release it.`);
  }, [refresh, flash]);

  const updateFile = useCallback(async (file, fields) => {
    await api.updateFile(file.id, fields);
    await refresh(file.track);
    flash("Changes saved.");
  }, [refresh, flash]);

  const annotate = useCallback(async (file, annotation) => {
    await api.updateFile(file.id, { annotation });
    await refresh(file.track);
    flash("Annotation saved.");
  }, [refresh, flash]);

  const publish = useCallback(async (file) => {
    await api.publishFile(file.id);
    await refresh(file.track);
    flash("File published — readers can download it now.");
  }, [refresh, flash]);

  const remove = useCallback(async (file) => {
    await api.deleteFile(file.id);
    await refresh(file.track);
    flash("File deleted — recorded in the audit log.");
  }, [refresh, flash]);

  const download = useCallback(async (file) => {
    if (file.download_url) window.open(file.download_url, "_blank", "noopener");
    try {
      await api.markDownloaded(file.id);
      await refresh(file.track);
    } catch { /* a download that isn't recorded shouldn't block the user */ }
  }, [refresh]);

  // ── Modals / confirm ──
  const openUpload = useCallback((trackId) => setModal({ kind: "upload", trackId }), []);
  const openEdit = useCallback((file) => setModal({ kind: "edit", file }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const askDelete = useCallback((file) => setConfirm({ file }), []);
  const cancelDelete = useCallback(() => setConfirm(null), []);
  const confirmDelete = useCallback(async () => {
    const file = confirm?.file;
    setConfirm(null);
    if (file) await remove(file);
  }, [confirm, remove]);

  return {
    user, authError, authBusy,
    tracks, tracksError, filesByTrack, loadingFiles,
    route, modal, confirm, toast,
    actions: {
      login, loginAs, logout, go, loadFiles, flash,
      upload, updateFile, annotate, publish, remove, download,
      openUpload, openEdit, closeModal, askDelete, cancelDelete, confirmDelete,
    },
  };
}
