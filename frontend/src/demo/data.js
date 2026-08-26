// Demo data for the Wisery Academy Portal, ported verbatim from the
// interactive design prototype (the "standalone" mockup). This drives the
// client-side demo: the role switcher, the six material tracks, every file
// table, the two deep item pages, the Technical Section, search, FAQ and
// contact. Real deployments swap this for the live API — but the demo runs
// entirely from here so it looks and behaves exactly like the prototype.

export const TRACKS = [
  {
    id: "decks", num: "01", title: "Slide Decks", kicker: "Track 01 · Instructor material",
    blurb: "Full instructor slide decks for all 5 days — theory, architecture diagrams and module walkthroughs. Editable PowerPoint.",
    meta: "18 Aug 2026", count: "5 files", zipSize: "412 MB",
    progressLabel: "Days read", progressValue: "3 / 5", progressNum: 60, done: 3, total: 5,
    colIndex: "Day", colExtra: "Status", footNote: "Decks are editable — internal reuse permitted under your training licence.",
  },
  {
    id: "labs", num: "02", title: "Hands-On Lab Guides", kicker: "Track 02 · Practical",
    blurb: "Step-by-step booklets for all 10 labs, with screenshots, expected outputs and troubleshooting tips. Five of the labs also ship a recorded instruction video.",
    meta: "21 Aug 2026", count: "10 guides · 5 videos", zipSize: "188 MB",
    progressLabel: "Labs complete", progressValue: "4 / 10", progressNum: 40, done: 1, total: 5,
    colIndex: "Lab", colExtra: "Your status", footNote: "Lab environments stay available for 90 days after the course.",
  },
  {
    id: "prompts", num: "03", title: "Prompt Engineering Playbook", kicker: "Track 03 · Reference",
    blurb: "Curated library of intelligence-domain prompts, templates and patterns — best practices and anti-patterns.",
    meta: "14 Aug 2026", count: "6 files", zipSize: "24 MB",
    progressLabel: "Sections read", progressValue: "2 / 9", progressNum: 22, done: 2, total: 5,
    colIndex: "#", colExtra: "Status", footNote: "Prompt library is versioned — subscribe to be notified of new patterns.",
  },
  {
    id: "datasets", num: "04", title: "Sample Datasets", kicker: "Track 04 · Practice data",
    blurb: "Anonymized intelligence documents and data used in the labs — reusable for practice after the course.",
    meta: "21 Aug 2026", count: "12 sets", zipSize: "6.4 GB",
    progressLabel: "Sets downloaded", progressValue: "5 / 12", progressNum: 42, done: 4, total: 5,
    colIndex: "#", colExtra: "Classification", footNote: "All records are synthetic or irreversibly anonymized. Redistribution outside your organisation is not permitted.",
  },
  {
    id: "admin", num: "05", title: "Administrator Guide", kicker: "Track 05 · Operations",
    blurb: "Technical documentation covering system configuration, user management and day-to-day operations.",
    meta: "12 Aug 2026", count: "4 files", zipSize: "58 MB",
    progressLabel: "Volumes read", progressValue: "1 / 4", progressNum: 25, done: 0, total: 5,
    colIndex: "Vol", colExtra: "Audience", footNote: "Matches platform release 2.9. Older releases are in the archive.",
  },
  {
    id: "cert", num: "06", title: "Certification Study Guide", kicker: "Track 06 · Exam prep",
    blurb: "Focused review aligned to the exam: key concepts, mock questions and exam-day tips.",
    meta: "19 Aug 2026", count: "3 files", zipSize: "31 MB",
    progressLabel: "Mock exams taken", progressValue: "0 / 3", progressNum: 4, done: 0, total: 5,
    colIndex: "#", colExtra: "Status", footNote: "Two mock attempts are included with your enrolment.",
  },
];

export const ROWS = {
  labs: [
    { i: "01", title: "Ingesting a mixed-source document set", sub: "Connectors, parsing, OCR fallback", st: "Complete", tone: "success", v: "2.4.1", size: "14 MB", fmt: "PDF + MP4", video: "Video · 18 min" },
    { i: "02", title: "Building your first entity graph", sub: "Extraction rules and resolution", st: "Complete", tone: "success", v: "2.4.1", size: "19 MB", fmt: "PDF + MP4", video: "Video · 24 min" },
    { i: "03", title: "Querying across languages", sub: "Translation pipeline, transliteration", st: "Complete", tone: "success", v: "2.4.0", size: "12 MB", fmt: "PDF" },
    { i: "04", title: "Timeline reconstruction from device data", sub: "Chat, call and location correlation", st: "Complete", tone: "success", v: "2.4.2", size: "22 MB", fmt: "PDF + MP4", video: "Video · 31 min" },
    { i: "05", title: "Prompt-driven summarisation at scale", sub: "Batch jobs and quality checks", st: "In progress", tone: "warning", v: "2.4.2", size: "17 MB", fmt: "PDF + MP4", video: "Video · 22 min" },
    { i: "06", title: "Geospatial analysis and route inference", sub: "Tower anchors, dwell detection", st: "Not started", tone: "neutral", v: "2.4.0", size: "25 MB", fmt: "PDF" },
    { i: "07", title: "Link analysis on financial records", sub: "Ledger import, pattern queries", st: "Not started", tone: "neutral", v: "2.4.0", size: "16 MB", fmt: "PDF" },
    { i: "08", title: "Building a shareable case dossier", sub: "Reports, redaction, export", st: "Not started", tone: "neutral", v: "2.4.1", size: "13 MB", fmt: "PDF" },
    { i: "09", title: "Working with restricted classifications", sub: "Security levels and compartments", st: "Not started", tone: "neutral", v: "2.4.1", size: "11 MB", fmt: "PDF" },
    { i: "10", title: "End-to-end investigation walkthrough", sub: "Capstone exercise, 3 hours", st: "Not started", tone: "neutral", v: "2.4.2", size: "29 MB", fmt: "PDF + MP4", video: "Video · 46 min" },
  ],
  datasets: [
    { i: "01", title: "Northern corridor — seized device dump", sub: "2 devices · chats, calls, media metadata", st: "Anonymized", tone: "warning", v: "r3", size: "1.8 GB", fmt: "ZIP" },
    { i: "02", title: "Mixed-language document bundle", sub: "4,120 documents · AR / FA / EN", st: "Anonymized", tone: "warning", v: "r2", size: "640 MB", fmt: "ZIP" },
    { i: "03", title: "Financial ledger set — shell entities", sub: "38,000 transactions, 214 accounts", st: "Synthetic", tone: "success", v: "r5", size: "96 MB", fmt: "CSV" },
    { i: "04", title: "Cell-tower location traces", sub: "11 subscribers · 90 days", st: "Synthetic", tone: "success", v: "r4", size: "212 MB", fmt: "PARQUET" },
    { i: "05", title: "Open-source social media crawl", sub: "1.2M posts, 3 platforms", st: "Anonymized", tone: "warning", v: "r1", size: "2.1 GB", fmt: "JSONL" },
    { i: "06", title: "Voice call sample set", sub: "340 recordings with transcripts", st: "Anonymized", tone: "warning", v: "r2", size: "780 MB", fmt: "ZIP" },
    { i: "07", title: "Border-crossing manifest extract", sub: "52,000 records, 4 checkpoints", st: "Synthetic", tone: "success", v: "r3", size: "48 MB", fmt: "CSV" },
    { i: "08", title: "Imagery set — vehicle identification", sub: "6,400 labelled frames", st: "Synthetic", tone: "success", v: "r1", size: "520 MB", fmt: "ZIP" },
    { i: "09", title: "Entity watchlist (training copy)", sub: "900 entities with aliases", st: "Synthetic", tone: "success", v: "r6", size: "3 MB", fmt: "JSON" },
    { i: "10", title: "Email corpus — corporate leak simulation", sub: "88,000 messages, 12 mailboxes", st: "Synthetic", tone: "success", v: "r2", size: "310 MB", fmt: "MBOX" },
    { i: "11", title: "Sensor and telemetry feed replay", sub: "14 days of streaming events", st: "Synthetic", tone: "success", v: "r1", size: "156 MB", fmt: "JSONL" },
    { i: "12", title: "Capstone case bundle (Lab 10)", sub: "Everything Lab 10 needs, pre-linked", st: "Anonymized", tone: "warning", v: "r2", size: "1.1 GB", fmt: "ZIP" },
  ],
  decks: [
    { i: "D1", title: "Day 1 — Platform foundations", sub: "Architecture, data model, ingest", st: "Read", tone: "success", v: "2.4.1", size: "96 MB", fmt: "PPTX" },
    { i: "D2", title: "Day 2 — Entity resolution & graphs", sub: "Extraction, resolution, review", st: "Read", tone: "success", v: "2.4.1", size: "104 MB", fmt: "PPTX" },
    { i: "D3", title: "Day 3 — Language & multimedia", sub: "Translation, ASR, imagery", st: "Read", tone: "success", v: "2.4.0", size: "88 MB", fmt: "PPTX" },
    { i: "D4", title: "Day 4 — Analysis workflows", sub: "Timelines, geospatial, link analysis", st: "Not read", tone: "neutral", v: "2.4.2", size: "78 MB", fmt: "PPTX" },
    { i: "D5", title: "Day 5 — Operations & certification", sub: "Admin, scaling, exam briefing", st: "Not read", tone: "neutral", v: "2.4.2", size: "46 MB", fmt: "PPTX" },
  ],
  prompts: [
    { i: "01", title: "Playbook — full edition", sub: "9 chapters, 140 pages", st: "Updated", tone: "warning", v: "3.1", size: "11 MB", fmt: "PDF" },
    { i: "02", title: "Prompt library (importable)", sub: "186 prompts with metadata", st: "Updated", tone: "warning", v: "3.1", size: "2 MB", fmt: "JSON" },
    { i: "03", title: "Summarisation patterns", sub: "Chapter extract + worked examples", st: "Stable", tone: "success", v: "3.0", size: "3 MB", fmt: "PDF" },
    { i: "04", title: "Entity & relation extraction patterns", sub: "Chapter extract", st: "Stable", tone: "success", v: "3.0", size: "3 MB", fmt: "PDF" },
    { i: "05", title: "Anti-patterns and failure modes", sub: "What not to do, with fixes", st: "Stable", tone: "success", v: "3.0", size: "2 MB", fmt: "PDF" },
    { i: "06", title: "Evaluation rubric template", sub: "Scoring sheet for prompt quality", st: "Stable", tone: "success", v: "2.2", size: "400 KB", fmt: "XLSX" },
  ],
  admin: [
    { i: "V1", title: "Installation & deployment", sub: "Topologies, sizing, prerequisites", st: "Admins", tone: "none", v: "2.9", size: "18 MB", fmt: "PDF" },
    { i: "V2", title: "User & role management", sub: "SSO, security levels, audit", st: "Admins", tone: "none", v: "2.9", size: "14 MB", fmt: "PDF" },
    { i: "V3", title: "Data sources & connectors", sub: "Configuration reference", st: "Admins", tone: "none", v: "2.9", size: "16 MB", fmt: "PDF" },
    { i: "V4", title: "Operations & monitoring", sub: "Backups, health checks, upgrades", st: "Admins", tone: "none", v: "2.9", size: "10 MB", fmt: "PDF" },
  ],
  cert: [
    { i: "01", title: "Study guide — exam blueprint", sub: "6 domains, weighting, key concepts", st: "Not started", tone: "neutral", v: "2.4", size: "9 MB", fmt: "PDF" },
    { i: "02", title: "Mock exam A (80 questions)", sub: "Timed, with answer rationale", st: "Not started", tone: "neutral", v: "2.4", size: "4 MB", fmt: "PDF" },
    { i: "03", title: "Exam-day checklist", sub: "Logistics, proctoring, retake policy", st: "Not started", tone: "neutral", v: "2.4", size: "1 MB", fmt: "PDF" },
  ],
};

export const ITEMS = {
  "labs/04": {
    short: "Lab 04", code: "LAB 04", status: "Complete", tone: "success", meta: "2 h 15 min · intermediate · updated 21 Aug 2026",
    title: "Timeline reconstruction from device data",
    summary: "Take two seized devices and build a single defensible timeline: correlate chat, call and location records, resolve conflicting timestamps, and export the result into a case dossier.",
    bundleSize: "22 MB",
    sections: [
      { heading: "What you will do", kind: "prose", body: "You will work with the Northern corridor device dump — two phones with overlapping contacts. Starting from raw extraction files, you will normalise timestamps across time zones, merge the two devices into one event stream, and identify the three windows where both subjects were co-located. The lab ends with an exported timeline you can attach to a case." },
      { heading: "Before you start", kind: "list", items: [
        { text: "Lab 01 and Lab 02 completed — this lab assumes an existing ingested case." },
        { text: "Dataset 01, Northern corridor — seized device dump (r3) downloaded and unpacked." },
        { text: "A lab environment on release 2.9 or later; the timeline export changed in 2.9." },
        { text: "Roughly 8 GB free disk for the working copy." },
      ] },
      { heading: "Steps", kind: "steps", steps: [
        { n: "1", title: "Load both device extractions", detail: "Import the two UFDR bundles and confirm the record counts match the manifest.", time: "15 min" },
        { n: "2", title: "Normalise timestamps", detail: "Set the case time zone, then reconcile device clock drift using the reference call log.", time: "25 min" },
        { n: "3", title: "Merge into one event stream", detail: "Apply the merge rule set and review the 40 conflicts the resolver flags.", time: "30 min" },
        { n: "4", title: "Correlate location anchors", detail: "Join cell-tower traces to the event stream and mark co-location windows.", time: "35 min" },
        { n: "5", title: "Export the timeline", detail: "Produce a redacted PDF timeline plus the machine-readable event file.", time: "20 min" },
      ] },
      { heading: "Instruction video — 31 min, 5 chapters", kind: "steps", steps: [
        { n: "0:00", title: "What we are building", detail: "The finished timeline, so you know what you are aiming at.", time: "3 min" },
        { n: "3:10", title: "Loading both extractions", detail: "Screen recording of the import, including the manifest check.", time: "6 min" },
        { n: "9:40", title: "Clock drift, explained slowly", detail: "Why the reference call log is the anchor, and the double-offset trap.", time: "8 min" },
        { n: "17:55", title: "Resolving the 40 merge conflicts", detail: "Working through each conflict class with the instructor.", time: "9 min" },
        { n: "26:30", title: "Exporting and sanity-checking", detail: "Redaction settings and what a correct histogram looks like.", time: "5 min" },
      ] },
      { heading: "If something goes wrong", kind: "callout", calloutLabel: "Troubleshooting", body: "The most common failure is a clock-drift value applied twice, which pushes every event 4 hours forward. Re-run step 2 from a clean import rather than adjusting the offset a second time — section 6.3 of the guide shows the tell-tale pattern in the event histogram." },
    ],
    files: [
      { format: "MP4", name: "Lab 04 — Instruction video", detail: "640 MB · 31 min · 1080p" },
      { format: "VTT", name: "Video subtitles (EN, HE)", detail: "86 KB · 2 tracks" },
      { format: "PDF", name: "Lab 04 — Guide (v2.4.2)", detail: "22 MB · 48 pages" },
      { format: "ZIP", name: "Lab 04 — Starter case", detail: "1.8 GB · dataset 01 pre-linked" },
      { format: "JSON", name: "Merge rule set", detail: "48 KB · importable" },
      { format: "PDF", name: "Expected outputs", detail: "3 MB · reference screenshots" },
    ],
    details: [
      { k: "Lab number", v: "04 of 10" },
      { k: "Guide version", v: "2.4.2" },
      { k: "Platform release", v: "2.9+" },
      { k: "Your status", v: "Complete · 12 Aug" },
      { k: "Instructor", v: "R. Ben-Ami" },
      { k: "Video", v: "31 min · watched" },
    ],
    related: [
      { label: "Dataset 01 — device dump", to: ["item", "datasets/01"] },
      { label: "Day 4 deck — Analysis workflows", to: ["category", "decks"] },
      { label: "Lab 06 — Geospatial analysis", to: ["category", "labs"] },
    ],
  },
  "datasets/01": {
    short: "Dataset 01", code: "DATASET 01", status: "Anonymized", tone: "warning", meta: "Release r3 · 1.8 GB · published 21 Aug 2026",
    title: "Northern corridor — seized device dump",
    summary: "Two mobile device extractions with overlapping contacts, used across Labs 04, 06 and 10. Every identifier has been irreversibly replaced; the behavioural structure — timing, contact frequency, movement — is preserved so analysis exercises stay realistic.",
    bundleSize: "1.8 GB",
    sections: [
      { heading: "What is in the set", kind: "steps", steps: [
        { n: "A", title: "device-a/ — 41,200 records", detail: "Chats (3 apps), call log, contacts, media metadata, browser history.", time: "1.1 GB" },
        { n: "B", title: "device-b/ — 18,600 records", detail: "Chats (2 apps), call log, contacts, sparse location history.", time: "520 MB" },
        { n: "C", title: "towers/ — 90 days", detail: "Cell-tower connection traces for both subscribers.", time: "140 MB" },
        { n: "D", title: "manifest + checksums", detail: "Record counts per file and a SHA-256 manifest for verification.", time: "2 MB" },
      ] },
      { heading: "How it was anonymized", kind: "prose", body: "Names, phone numbers, IMEIs, account handles and precise coordinates were replaced with consistent synthetic values — consistent meaning the same source identifier always maps to the same replacement, so link analysis still works. Coordinates were displaced by a fixed random offset per case and snapped to a 250 m grid. Free-text message bodies were regenerated by paraphrase, keeping length, language and sentiment." },
      { heading: "Terms of use", kind: "callout", calloutLabel: "Please read", body: "This set is licensed for your own practice and for internal training inside your organisation. It may not be redistributed externally, published, or used to benchmark third-party products. Attribution: Wisery Academy sample data, release r3." },
      { heading: "Used by", kind: "list", items: [
        { text: "Lab 04 — Timeline reconstruction from device data (required)." },
        { text: "Lab 06 — Geospatial analysis and route inference (required)." },
        { text: "Lab 10 — End-to-end investigation walkthrough (partial)." },
      ] },
    ],
    files: [
      { format: "ZIP", name: "northern-corridor-r3.zip", detail: "1.8 GB · full set" },
      { format: "ZIP", name: "device-a-only.zip", detail: "1.1 GB · partial" },
      { format: "CSV", name: "towers-90d.csv", detail: "140 MB" },
      { format: "TXT", name: "SHA256SUMS", detail: "4 KB · verify first" },
    ],
    details: [
      { k: "Release", v: "r3 · 21 Aug 2026" },
      { k: "Records", v: "59,800 + traces" },
      { k: "Languages", v: "EN, AR, FA" },
      { k: "Classification", v: "Anonymized · internal" },
      { k: "Your copy", v: "Downloaded 09 Aug (r2)" },
    ],
    related: [
      { label: "Lab 04 — Timeline reconstruction", to: ["item", "labs/04"] },
      { label: "Dataset 04 — Cell-tower traces", to: ["category", "datasets"] },
      { label: "Anonymisation methodology note", to: ["faq", null] },
    ],
  },
};

export const TECH = [
  { title: "Runbooks", blurb: "Step-by-step operational procedures for the 40 most common support actions.", count: "41 runbooks", tier: "Tier 1+" },
  { title: "Troubleshooting & known issues", blurb: "Symptom-first index of known defects, workarounds and fix versions.", count: "128 entries", tier: "Tier 1+" },
  { title: "Release notes", blurb: "Every platform release with breaking changes, migrations and rollback notes.", count: "2.0 → 2.9", tier: "Tier 1+" },
  { title: "Architecture & deployment docs", blurb: "Reference topologies, service maps, network and storage requirements.", count: "19 documents", tier: "Tier 2" },
  { title: "Internal tooling & scripts", blurb: "Diagnostic collectors, reindex utilities and migration helpers.", count: "23 tools", tier: "Tier 2" },
  { title: "Escalation paths", blurb: "Who to page, when, and what evidence to attach before escalating.", count: "6 flows", tier: "Tier 1+" },
  { title: "Log & telemetry reference", blurb: "Field-by-field meaning of every log stream and metric the platform emits.", count: "340 fields", tier: "Tier 2" },
];

export const RESULTS = [
  { track: "Hands-On Lab Guides", loc: "Lab 04 · §4.2", locked: false, title: "Correlating cell-tower anchors with device events", snippet: "Join the tower trace to the merged event stream, then mark every window where both subjects share an anchor for more than fifteen minutes…", to: ["item", "labs/04"] },
  { track: "Sample Datasets", loc: "Dataset 01 · towers/", locked: false, title: "Northern corridor — seized device dump", snippet: "90 days of cell-tower connection traces for both subscribers, displaced by a fixed offset and snapped to a 250 m grid…", to: ["item", "datasets/01"] },
  { track: "Prompt Playbook", loc: "Chapter 5", locked: false, title: "Location-reasoning prompt patterns", snippet: "Patterns for asking a model to reason over sparse location evidence without inventing movement between anchors…", to: ["category", "prompts"] },
  { track: "Technical Section", loc: "Runbook RB-118", locked: true, title: "Tower-trace ingest job stalls at 90%", snippet: "Title visible only. Full runbook requires Tier 1 support access.", to: ["tech", null] },
  { track: "Slide Decks", loc: "Day 4 · slides 22–31", locked: false, title: "Geospatial analysis walkthrough", snippet: "Diagram set covering anchor confidence, dwell detection and route inference over incomplete traces…", to: ["category", "decks"] },
  { track: "FAQ", loc: "Access & licensing", locked: false, title: "Can I use the lab datasets in my own environment?", snippet: "Yes — for internal practice and training inside your organisation. Redistribution outside it is not permitted…", to: ["faq", null] },
];

export const FACETS = [
  { label: "Hands-On Lab Guides", n: "9" },
  { label: "Sample Datasets", n: "6" },
  { label: "Slide Decks", n: "5" },
  { label: "Prompt Playbook", n: "3" },
  { label: "FAQ", n: "2" },
  { label: "Technical Section", n: "4 locked" },
];

export const FAQS = [
  { q: "How long do I keep access to the portal?", a: "Your account stays active for 24 months after the course, and certified alumni keep read and download access indefinitely. Lab environments are the exception — those expire 90 days after the last course day." },
  { q: "Can I use the sample datasets in my own environment?", a: "Yes. Every dataset is synthetic or irreversibly anonymized and is licensed for practice and internal training inside your organisation. You may not redistribute it externally, publish it, or use it to benchmark other products." },
  { q: "Are the slide decks editable?", a: "They ship as editable PowerPoint so you can adapt them for internal sessions. Keep the Wisery attribution slide in place, and re-download before reusing — decks are re-versioned with each platform release." },
  { q: "Why can I see the Technical Section but not open it?", a: "It is listed so you know what exists and can point a colleague at it. The content itself is limited to Wisery Tier 1 and Tier 2 support engineers and the platform on-call team. Use Request access if your role changed." },
  { q: "A file I need is missing or out of date. What now?", a: "Use the contact form and include the track and file name. Missing files are usually restored the same day; version questions go to the platform team, who publish an updated manifest." },
  { q: "How does the certification exam work?", a: "The exam opens two weeks after your course ends and stays open for 60 days. It is 80 questions across six domains, proctored remotely, and your enrolment includes two mock attempts plus one retake." },
  { q: "Does search look inside the files?", a: "Yes — search covers file contents, individual lab steps and FAQ answers. Restricted material returns titles only, so you can tell something exists without seeing it." },
  { q: "Can I share my login with a colleague?", a: "No. Accounts are tied to a person and to your organisation’s SSO, and downloads are logged. Additional seats can be added by your account admin at no cost for staff who attended the course." },
];

export const CHANNELS = [
  { kicker: "Training", title: "Your training lead", blurb: "Course content, lab problems, certification scheduling and material requests.", detail: "academy@wisery.ai · 1 business day" },
  { kicker: "Platform support", title: "Support desk", blurb: "Anything about a live Wisery deployment — incidents, configuration, upgrades.", detail: "support.wisery.ai · 24/7 for P1" },
  { kicker: "Access", title: "Account & permissions", blurb: "Portal access, extra seats, role changes and Technical Section requests.", detail: "access@wisery.ai · 2 business days" },
];

export const TOPICS = ["Material request", "Lab problem", "Certification", "Access / permissions", "Something else"];

export const ROLES = {
  user: { label: "Student", name: "Dana Levi", initials: "DL", role: "Student · Cohort 12" },
  technical: { label: "Technical", name: "Omer Katz", initials: "OK", role: "Technical · Tier 2 support" },
  editor: { label: "Editor", name: "Maya Shani", initials: "MS", role: "Editor · Academy content" },
};

export const SEED_NOTES = {
  "labs/05": [{ who: "Maya Shani", when: "19 Aug 09:40", text: "Step 4 screenshots are from 2.8 — the batch panel moved in 2.9. Updated guide lands this week." }],
  "datasets/05": [{ who: "Maya Shani", when: "12 Aug 16:02", text: "Platform B crawl is truncated at 400k posts pending a re-anonymisation pass. Use datasets 02 or 10 for volume exercises." }],
};

export const SEED_ACTIVITY = [
  { when: "21 Aug 11:20", kind: "added", text: "Maya Shani published Lab 04 — Instruction video (640 MB, MP4)" },
  { when: "19 Aug 09:40", kind: "annotated", text: "Maya Shani annotated Lab 05 — Prompt-driven summarisation at scale" },
  { when: "18 Aug 15:07", kind: "replaced", text: "Maya Shani replaced Lab 02 — Guide v2.4.0 with v2.4.1" },
  { when: "14 Aug 08:55", kind: "deleted", text: "R. Ben-Ami removed Lab 07 — Guide v2.3.4 (superseded)" },
];

// The login-screen supporting copy.
export const LOGIN_FACTS = [
  "Six material tracks from the certification program — decks, lab guides with instruction videos, prompt playbook, sample datasets, admin guide and exam prep.",
  "The Technical Section — runbooks, release notes, escalation paths — opens only for Tier 1 and Tier 2 support engineers.",
  "Editors manage folder contents in place: add, delete and annotate, with every action written to the audit log.",
];

export const LOGIN_ROLES = [
  { key: "user", initials: "DL", name: "Dana Levi", perm: "Student — read and download, no Technical Section" },
  { key: "technical", initials: "OK", name: "Omer Katz", perm: "Technical — read and download everything" },
  { key: "editor", initials: "MS", name: "Maya Shani", perm: "Editor — add, delete and annotate all folders" },
];
