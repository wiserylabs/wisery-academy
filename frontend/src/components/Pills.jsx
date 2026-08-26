const STATUS_LABEL = { draft: "Draft", published: "Published" };
const VISIBILITY_LABEL = {
  all: "All roles",
  technical_plus: "Technical +",
  editors_only: "Editors only",
};

export function StatusPill({ status }) {
  return <span className={`pill status-${status}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function VisibilityPill({ visibility }) {
  return <span className={`pill visibility-${visibility}`}>{VISIBILITY_LABEL[visibility] ?? visibility}</span>;
}

export function formatSize(bytes) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}
