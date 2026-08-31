import { useState } from "react";
import { Icon } from "../demo/ui.jsx";

const CHANNELS = [
  { kicker: "Training", title: "Your training lead", blurb: "Course content, lab problems, certification scheduling and material requests.", detail: "academy@wisery.ai · 1 business day" },
  { kicker: "Platform support", title: "Support desk", blurb: "Anything about a live Wisery deployment — incidents, configuration, upgrades.", detail: "support.wisery.ai · 24/7 for P1" },
  { kicker: "Access", title: "Account & permissions", blurb: "Portal access, extra seats, role changes and Technical Section requests.", detail: "access@wisery.ai · 2 business days" },
];
const TOPICS = ["Material request", "Lab problem", "Certification", "Access / permissions", "Something else"];

export default function Contact() {
  const [topic, setTopic] = useState("Material request");
  const [sent, setSent] = useState(false);

  return (
    <div className="contact">
      <div className="page-head">
        <span className="page-kicker">Contact</span>
        <h1>Get in touch</h1>
        <p>Reach the right team directly, or send a message and we’ll route it for you.</p>
      </div>

      <div className="contact-channels">
        {CHANNELS.map((c) => (
          <div key={c.title} className="channel-card">
            <span className="channel-kicker">{c.kicker}</span>
            <h3>{c.title}</h3>
            <p>{c.blurb}</p>
            <span className="channel-detail">{c.detail}</span>
          </div>
        ))}
      </div>

      <div className="contact-form">
        <h2>Send a message</h2>
        <div className="field">
          <label>What is this about?</label>
          <div className="topic-pills">
            {TOPICS.map((t) => (
              <button key={t} type="button" className={`topic-pill ${topic === t ? "active" : ""}`} onClick={() => setTopic(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="field-row">
          <div className="field"><label>Your name</label><input type="text" placeholder="Dana Levi" /></div>
          <div className="field"><label>Work email</label><input type="email" placeholder="name@organisation.gov" /></div>
        </div>
        <div className="field">
          <label>Message</label>
          <textarea rows={5} placeholder="Include the track and file name if this is about a specific material." />
        </div>
        <div className="contact-form-foot">
          <button type="button" className={`btn btn-solid ${sent ? "sent" : ""}`} onClick={() => setSent(true)} disabled={sent}>
            {sent ? <>Sent <Icon name="check" size={15} /></> : "Send message"}
          </button>
          <span className="contact-form-note">Routed to the {topic.toLowerCase()} team · replies to your work email.</span>
        </div>
      </div>
    </div>
  );
}
