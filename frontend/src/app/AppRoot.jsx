import Faq from "../demo/Faq.jsx";
import Footer from "../demo/Footer.jsx";
import { Icon } from "../demo/ui.jsx";
import Category from "./Category.jsx";
import Confirm from "./Confirm.jsx";
import Contact from "./Contact.jsx";
import FileDrawer from "./FileDrawer.jsx";
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Search from "./Search.jsx";
import Technical from "./Technical.jsx";
import { useApp } from "./useApp.js";

function Toast({ toast }) {
  if (!toast) return null;
  return <div className="toast" role="status"><Icon name="check" size={15} /> {toast}</div>;
}

function CurrentRoute({ app }) {
  const { route, tracks, filesByTrack, loadingFiles, tracksError, user, actions } = app;

  if (route.name === "category") {
    const track = tracks.find((t) => t.id === route.trackId);
    if (!track) return <p className="muted">Loading…</p>;
    // A Student can never see the Technical Section's file list — the folder
    // exists for them, but only as the locked "request access" page.
    if (track.slug === "technical-section" && user.role === "student") {
      return <Technical actions={actions} />;
    }
    return (
      <Category
        track={track}
        files={filesByTrack[track.id]}
        loadingFiles={loadingFiles}
        role={user.role}
        actions={actions}
      />
    );
  }

  switch (route.name) {
    case "technical": return <Technical actions={actions} />;
    case "search": return <Search query={route.query} tracks={tracks} filesByTrack={filesByTrack} actions={actions} />;
    case "faq": return <Faq />;
    case "contact": return <Contact />;
    default: return <Home tracks={tracks} tracksError={tracksError} role={user.role} actions={actions} />;
  }
}

export default function AppRoot() {
  const app = useApp();
  const { user, authError, authBusy, tracks, modal, confirm, toast, route, actions } = app;

  if (!user) {
    return <Login actions={actions} authError={authError} authBusy={authBusy} />;
  }

  return (
    <div className="app">
      <Header user={user} route={route} actions={actions} />
      <main className="app-main">
        <div className="app-container">
          <CurrentRoute app={app} />
        </div>
      </main>
      <Footer />
      {modal && <FileDrawer modal={modal} tracks={tracks} actions={actions} />}
      {confirm && <Confirm confirm={confirm} actions={actions} />}
      <Toast toast={toast} />
    </div>
  );
}
