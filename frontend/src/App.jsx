import "./styles.css";
import DemoApp from "./demo/DemoApp.jsx";

// The Wisery Academy Portal — a faithful, self-contained reproduction of the
// design prototype. The whole experience (login, the six material tracks,
// every file table, the deep lab/dataset pages, the Technical Section, search,
// FAQ, contact, the live role switcher and the Editor manage-mode) runs
// client-side from src/demo/, so it looks and behaves exactly like the mockup
// without needing the backend. Swap DemoApp for API-backed screens when wiring
// this to the live Django service.
export default function App() {
  return <DemoApp />;
}
