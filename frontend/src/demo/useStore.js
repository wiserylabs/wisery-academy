import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROLES, SEED_NOTES } from "./data.js";

// Client-side state machine for the demo portal — a direct port of the
// prototype's component logic. Routing, the role switcher, and the Editor
// manage-mode (add / delete / annotate, with an activity log and audit-style
// confirmations) all live here so the whole thing runs without a backend.

const INITIAL = {
  route: "home",
  catId: "labs",
  itemId: "labs/04",
  query: "",
  submitted: "tower traces",
  filter: "All",
  topic: "Material request",
  sent: false,
  authed: false,
  login: { email: "", password: "", remember: true },
  role: "user",
  manage: false,
  sel: [],
  notes: SEED_NOTES,
  added: [],
  removed: [],
  drawer: null,
  confirmOpen: false,
  toast: "",
  draft: { title: "", version: "", note: "", visibility: "All roles" },
};

export function useStore() {
  const [state, setState] = useState(INITIAL);
  const patch = useCallback((p) => {
    setState((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));
  }, []);

  // Toast auto-dismiss, keyed on a token so repeated flashes reset the timer.
  const toastToken = useRef(0);
  const flash = useCallback((msg) => {
    toastToken.current += 1;
    const mine = toastToken.current;
    setState((s) => ({ ...s, toast: msg }));
    setTimeout(() => {
      if (toastToken.current === mine) setState((s) => ({ ...s, toast: "" }));
    }, 2600);
  }, []);

  const scrollTop = () => window.scrollTo(0, 0);

  const actions = useMemo(() => {
    const go = (route, arg) => {
      setState((s) => {
        const next = { ...s, route };
        if (route === "category") { next.catId = arg; next.filter = "All"; }
        if (route === "item") { next.itemId = arg; next.catId = arg.split("/")[0]; }
        return next;
      });
      scrollTop();
    };

    const signIn = (role) => {
      setState((s) => ({ ...s, role, route: "home", authed: true, manage: false, sel: [], drawer: null }));
      scrollTop();
    };

    const setDraft = (dp) => patch((s) => ({ draft: { ...s.draft, ...dp } }));

    const toggleRow = (key) =>
      patch((s) => ({ sel: s.sel.includes(key) ? s.sel.filter((k) => k !== key) : s.sel.concat(key) }));

    const commitDrawer = () => {
      setState((s) => {
        const { drawer, draft } = s;
        if (!drawer) return s;
        if (drawer.kind === "add") {
          const title = draft.title.trim() || "Untitled upload";
          flash("“" + title + "” uploaded as a draft — scanning, then publish to release it.");
          return {
            ...s,
            added: s.added.concat({ cat: s.catId, title, version: draft.version.trim() || "draft" }),
            drawer: null,
            draft: { title: "", version: "", note: "", visibility: draft.visibility },
          };
        }
        const text = draft.note.trim();
        if (!text) return { ...s, drawer: null };
        const entry = { who: ROLES[s.role].name, when: "26 Aug 10:12", text };
        const notes = { ...s.notes };
        drawer.keys.forEach((k) => { notes[k] = (notes[k] || []).concat(entry); });
        flash(drawer.keys.length > 1 ? "Annotation added to " + drawer.keys.length + " files." : "Annotation added.");
        return { ...s, notes, drawer: null, sel: [], draft: { ...s.draft, note: "" } };
      });
    };

    const confirmDelete = () => {
      setState((s) => {
        const n = s.sel.length;
        flash(n + (n === 1 ? " file moved" : " files moved") + " to the recycle bin.");
        return { ...s, removed: s.removed.concat(s.sel), sel: [], confirmOpen: false };
      });
    };

    return {
      go,
      signIn,
      signOut: () => patch({ authed: false, route: "home", manage: false, sel: [], drawer: null }),
      setRole: (role) => patch({ role, manage: false, sel: [], drawer: null }),
      setLogin: (lp) => patch((s) => ({ login: { ...s.login, ...lp } })),
      setFilter: (filter) => patch({ filter }),
      setQuery: (query) => patch({ query }),
      submitSearch: (q) => { patch({ submitted: q || "tower traces", route: "search" }); scrollTop(); },
      setTopic: (topic) => patch({ topic }),
      send: () => patch({ sent: true }),
      toggleManage: () => patch((s) => ({ manage: !s.manage, sel: [] })),
      toggleRow,
      selectAll: (keys) => patch((s) => ({ sel: s.sel.length === keys.length ? [] : keys })),
      clearSelection: () => patch({ sel: [] }),
      openAdd: () => patch({ drawer: { kind: "add" } }),
      openNote: (keys, label) => patch((s) => ({ drawer: { kind: "note", keys, label }, draft: { ...s.draft, note: "" } })),
      closeDrawer: () => patch({ drawer: null }),
      commitDrawer,
      askDelete: (keys) => patch((s) => ({ sel: keys || s.sel, confirmOpen: true })),
      cancelDelete: () => patch({ confirmOpen: false }),
      confirmDelete,
      setDraft,
      flash,
    };
  }, [patch, flash]);

  return { state, actions };
}

// Keep the browser tab title in sync with the active route — small touch that
// makes the demo feel like a real multi-page app.
export function useRouteTitle(route) {
  useEffect(() => {
    const map = {
      home: "Wisery Academy", category: "Materials · Wisery Academy",
      item: "Wisery Academy", tech: "Technical Section · Wisery Academy",
      search: "Search · Wisery Academy", faq: "FAQ · Wisery Academy",
      contact: "Contact · Wisery Academy",
    };
    document.title = map[route] || "Wisery Academy";
  }, [route]);
}
