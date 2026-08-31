// Presentation helpers for real API data.

export function humanSize(bytes) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
  const rounded = n >= 100 || i === 0 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${rounded} ${units[i]}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const MIME_LABELS = {
  "application/pdf": "PDF",
  "application/zip": "ZIP",
  "text/csv": "CSV",
  "application/json": "JSON",
  "application/mbox": "MBOX",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "video/mp4": "MP4",
};

// A short format badge for a file: prefer the mime map, fall back to the
// stored file's extension, then to a generic label.
export function formatBadge(file) {
  if (file.mime_type && MIME_LABELS[file.mime_type]) return MIME_LABELS[file.mime_type];
  const url = file.download_url || "";
  const clean = url.split("?")[0];
  const ext = clean.includes(".") ? clean.split(".").pop() : "";
  if (ext && ext.length <= 5) return ext.toUpperCase();
  return "FILE";
}

export const VISIBILITY_LABEL = {
  all: "All roles",
  technical_plus: "Technical +",
  editors_only: "Editors only",
};

export const ROLE_LABEL = {
  student: "Student — read and download, no Technical Section",
  technical: "Technical — read and download everything",
  editor: "Editor — add, delete and annotate all folders",
};

export const ROLE_SHORT = {
  student: "Student",
  technical: "Technical",
  editor: "Editor",
};

// The seeded demo accounts, one per role — used by the login picker and the
// header "Viewing as" switcher to sign in for real.
export const DEMO_ACCOUNTS = {
  student: { email: "dana@wisery.ai", name: "Dana Levi", initials: "DL" },
  technical: { email: "omer@wisery.ai", name: "Omer Katz", initials: "OK" },
  editor: { email: "maya@wisery.ai", name: "Maya Shani", initials: "MS" },
};

export const DEMO_PASSWORD = "wisery-demo-1234";

export function initialsOf(user) {
  const source = (user?.full_name || user?.email || "?").trim();
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
