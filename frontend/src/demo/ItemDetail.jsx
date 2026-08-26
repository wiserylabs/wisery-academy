import { ITEMS, TRACKS } from "./data.js";
import { FormatBadge, Icon, StatusPill } from "./ui.jsx";

function Section({ section }) {
  const { heading, kind } = section;
  return (
    <section className="item-section">
      <h2 className="item-section-head">{heading}</h2>
      {kind === "prose" && <p className="item-prose">{section.body}</p>}
      {kind === "list" && (
        <ul className="item-list">
          {section.items.map((it, i) => (
            <li key={i}><Icon name="check" size={15} className="item-list-check" /> {it.text}</li>
          ))}
        </ul>
      )}
      {kind === "steps" && (
        <ol className="item-steps">
          {section.steps.map((s, i) => (
            <li key={i} className="item-step">
              <span className="item-step-n">{s.n}</span>
              <div className="item-step-body">
                <div className="item-step-top">
                  <span className="item-step-title">{s.title}</span>
                  <span className="item-step-time">{s.time}</span>
                </div>
                <span className="item-step-detail">{s.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      {kind === "callout" && (
        <div className="item-callout">
          <span className="item-callout-label">{section.calloutLabel}</span>
          <p>{section.body}</p>
        </div>
      )}
    </section>
  );
}

export default function ItemDetail({ state, actions }) {
  const item = ITEMS[state.itemId] || ITEMS["labs/04"];
  const cat = TRACKS.find((t) => t.id === state.catId) || TRACKS[1];

  return (
    <div className="item">
      <button type="button" className="back-link" onClick={() => actions.go("category", cat.id)}>
        <Icon name="back" size={15} /> {cat.title}
      </button>

      <div className="item-header">
        <div className="item-header-top">
          <span className="item-code">{item.code}</span>
          <StatusPill label={item.status} tone={item.tone} />
          <span className="item-meta">{item.meta}</span>
        </div>
        <h1 className="item-title">{item.title}</h1>
        <p className="item-summary">{item.summary}</p>
        <button type="button" className="btn btn-solid">
          <Icon name="download" size={15} /> Download bundle ({item.bundleSize})
        </button>
      </div>

      <div className="item-body">
        <div className="item-main">
          {item.sections.map((s, i) => <Section key={i} section={s} />)}
        </div>

        <aside className="item-aside">
          <div className="item-card">
            <span className="panel-kicker">Files in this bundle</span>
            <ul className="item-files">
              {item.files.map((f, i) => (
                <li key={i} className="item-file">
                  <FormatBadge format={f.format} />
                  <span className="item-file-body">
                    <span className="item-file-name">{f.name}</span>
                    <span className="item-file-detail">{f.detail}</span>
                  </span>
                  <button type="button" className="icon-btn sm" title={`Download ${f.name}`}>
                    <Icon name="download" size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="item-card">
            <span className="panel-kicker">Details</span>
            <dl className="item-details">
              {item.details.map((d, i) => (
                <div key={i} className="item-detail-row">
                  <dt>{d.k}</dt>
                  <dd>{d.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="item-card">
            <span className="panel-kicker">Related</span>
            <ul className="item-related">
              {item.related.map((r, i) => (
                <li key={i}>
                  <button type="button" className="item-related-link" onClick={() => actions.go(r.to[0], r.to[1])}>
                    {r.label} <Icon name="arrow" size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
