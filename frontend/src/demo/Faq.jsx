import { useState } from "react";
import { FAQS } from "./data.js";
import { Icon } from "./ui.jsx";

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      <div className="page-head">
        <span className="page-kicker">Help</span>
        <h1>Frequently asked questions</h1>
        <p>Access, licensing, the certification exam and how the portal handles restricted material.</p>
      </div>

      <ul className="faq-list">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button type="button" className="faq-q" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                <span>{f.q}</span>
                <Icon name="chevron" size={16} className="faq-chevron" />
              </button>
              {isOpen && <p className="faq-a">{f.a}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
