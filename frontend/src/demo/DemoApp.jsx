import Category from "./Category.jsx";
import Confirm from "./Confirm.jsx";
import Contact from "./Contact.jsx";
import Drawer from "./Drawer.jsx";
import Faq from "./Faq.jsx";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import ItemDetail from "./ItemDetail.jsx";
import Login from "./Login.jsx";
import Search from "./Search.jsx";
import Technical from "./Technical.jsx";
import { Icon } from "./ui.jsx";
import { useRouteTitle, useStore } from "./useStore.js";

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check" size={15} /> {toast}
    </div>
  );
}

function Route({ state, actions }) {
  switch (state.route) {
    case "category": return <Category state={state} actions={actions} />;
    case "item": return <ItemDetail state={state} actions={actions} />;
    case "tech": return <Technical state={state} actions={actions} />;
    case "search": return <Search state={state} actions={actions} />;
    case "faq": return <Faq state={state} actions={actions} />;
    case "contact": return <Contact state={state} actions={actions} />;
    default: return <Home state={state} actions={actions} />;
  }
}

export default function DemoApp() {
  const { state, actions } = useStore();
  useRouteTitle(state.authed ? state.route : "home");

  if (!state.authed) {
    return <Login state={state} actions={actions} />;
  }

  return (
    <div className="app">
      <Header state={state} actions={actions} />
      <main className="app-main">
        <div className="app-container">
          <Route state={state} actions={actions} />
        </div>
      </main>
      <Footer />
      <Drawer state={state} actions={actions} />
      <Confirm state={state} actions={actions} />
      <Toast toast={state.toast} />
    </div>
  );
}
