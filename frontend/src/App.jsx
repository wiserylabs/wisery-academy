import "./styles.css";
import AppRoot from "./app/AppRoot.jsx";

// The Wisery Academy Portal — the design prototype's look, wired to the live
// Django API. Login is real JWT auth (the demo picker and the header "Viewing
// as" switcher sign in as the seeded per-role accounts). Tracks and files come
// from the API, and the Editor tools (upload, edit, annotate, publish, delete)
// persist through it. See src/app/ for the connected screens; src/demo/ holds
// the earlier fully client-side mock and shared presentational bits.
export default function App() {
  return <AppRoot />;
}
