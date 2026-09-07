// Small shared presentational bits used across the demo screens.

const TONE_CLASS = {
  success: "tone-success",
  warning: "tone-warning",
  neutral: "tone-neutral",
  none: "tone-none",
};

export function StatusPill({ label, tone = "neutral", dot = true }) {
  return (
    <span className={`status-pill ${TONE_CLASS[tone] || "tone-neutral"}`}>
      {dot && <span className="status-dot" />}
      {label}
    </span>
  );
}

// The little progress "pips" row on the home track cards.
export function Pips({ done, total }) {
  return (
    <span className="pips" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`pip ${i < done ? "on" : ""}`} />
      ))}
    </span>
  );
}

export function FormatBadge({ format }) {
  return <span className="fmt-badge">{format}</span>;
}

// Inline SVG icon set — no external icon dependency, everything self-contained.
const PATHS = {
  search: "M11 4a7 7 0 1 0 4.2 12.6l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z",
  lock: "M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z",
  download: "M12 3v10.6l3.3-3.3 1.4 1.4L12 17.4l-4.7-4.7 1.4-1.4L12 13.6V3h0Zm-8 15h16v2H4v-2Z",
  arrow: "M13.2 5.6 11.8 7l4 4H4v2h11.8l-4 4 1.4 1.4L19.6 12l-6.4-6.4Z",
  back: "M10.8 5.6 4.4 12l6.4 6.4L12.2 17l-4-4H20v-2H8.2l4-4-1.4-1.4Z",
  plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z",
  pencil: "M4 15.5 14.9 4.6l4.5 4.5L8.5 20H4v-4.5Zm12.3-8.2-1.4-1.4-1.5 1.5 1.4 1.4 1.5-1.5Z",
  trash: "M9 3h6l1 2h4v2H4V5h4l1-2ZM6 8h12l-1 13H7L6 8Zm4 2v9h1v-9h-1Zm3 0v9h1v-9h-1Z",
  check: "M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.4 8.2 19 6.8 9.6 16.2Z",
  signout: "M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3Zm6.2 4.6L14.8 9l2 2H8v2h8.8l-2 2 1.4 1.4L21 12l-4.8-4.4Z",
  chevron: "M8.6 5.6 7.2 7l5 5-5 5 1.4 1.4L15 12 8.6 5.6Z",
  play: "M8 5v14l11-7L8 5Z",
  shield: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z",
  star: "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.9 6.1 20.9l1.2-6.5L2.5 9.8l6.6-.9L12 2.5z",
};

export function Icon({ name, size = 16, className = "" }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function Avatar({ initials, size = 32 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </span>
  );
}
