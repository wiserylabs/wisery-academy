import { FACETS, RESULTS } from "./data.js";
import { Icon } from "./ui.jsx";

export default function Search({ state, actions }) {
  return (
    <div className="search">
      <div className="search-head">
        <h1>
          Results for <span className="search-term">“{state.submitted}”</span>
        </h1>
        <span className="tracks-meta">29 matches across 6 areas · restricted items show titles only</span>
      </div>

      <div className="search-body">
        <aside className="search-facets">
          <span className="panel-kicker">Filter by area</span>
          <ul>
            {FACETS.map((f) => (
              <li key={f.label} className="facet">
                <span>{f.label}</span>
                <span className="facet-n">{f.n}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="search-results">
          {RESULTS.map((r, i) => (
            <button
              key={i}
              type="button"
              className={`result ${r.locked ? "locked" : ""}`}
              onClick={() => actions.go(r.to[0], r.to[1])}
            >
              <div className="result-top">
                <span className="result-track">{r.track}</span>
                <span className="result-loc">{r.loc}</span>
                {r.locked && <span className="result-lock"><Icon name="lock" size={12} /> Restricted</span>}
              </div>
              <span className="result-title">{r.title}</span>
              <span className="result-snippet">{r.snippet}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
