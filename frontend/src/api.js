const BASE = import.meta.env.VITE_API_URL || "/api";

let accessToken = null;

function summarizeErrors(body) {
  // DRF validation errors come back as {field: ["msg", ...]}, not
  // {detail: "..."} -- surface the first one so a failed upload/edit
  // shows something readable instead of "Request failed: 400".
  if (!body || typeof body !== "object") return null;
  const entry = Object.entries(body).find(([, v]) => Array.isArray(v) && v.length);
  if (!entry) return null;
  const [field, messages] = entry;
  return field === "non_field_errors" ? messages[0] : `${field}: ${messages[0]}`;
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  // A FormData body needs the browser to set its own multipart boundary --
  // forcing application/json here would silently break every file upload.
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || summarizeErrors(body) || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function toFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });
  return formData;
}

export const api = {
  async login(email, password) {
    const data = await request("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    accessToken = data.access;
    return data;
  },
  async signup(email, password, fullName) {
    return request("/auth/signup/", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  },
  me() {
    return request("/auth/me/");
  },
  async tracks() {
    const data = await request("/tracks/");
    // DRF's default pagination wraps the array in {count, next, previous,
    // results} -- unwrap it here so every caller just gets an array.
    return data?.results ?? data;
  },
  async files(trackId) {
    const data = await request(`/files/?track=${trackId}`);
    return data?.results ?? data;
  },
  uploadFile(fields) {
    return request("/files/", { method: "POST", body: toFormData(fields) });
  },
  updateFile(id, fields) {
    return request(`/files/${id}/`, { method: "PATCH", body: JSON.stringify(fields) });
  },
  publishFile(id) {
    return request(`/files/${id}/publish/`, { method: "POST" });
  },
  deleteFile(id) {
    return request(`/files/${id}/`, { method: "DELETE" });
  },
  markDownloaded(id) {
    return request(`/files/${id}/mark_downloaded/`, { method: "POST" });
  },
  // --- Editor-only user management ---
  async users() {
    const data = await request("/auth/users/");
    return data?.results ?? data;
  },
  createUser(fields) {
    return request("/auth/users/", { method: "POST", body: JSON.stringify(fields) });
  },
  updateUser(id, fields) {
    return request(`/auth/users/${id}/`, { method: "PATCH", body: JSON.stringify(fields) });
  },
  deleteUser(id) {
    return request(`/auth/users/${id}/`, { method: "DELETE" });
  },
  // Streams the file from the API (which is reachable everywhere) rather than
  // a presigned storage URL (which isn't, behind Docker/MinIO), then saves it
  // via a temporary object URL. Sends the JWT, so a plain link won't do.
  async downloadFile(id) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(`${BASE}/files/${id}/download/`, { headers });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Download failed: ${res.status}`);
    }
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    const filename = match ? decodeURIComponent(match[1]) : "download";
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
  logout() {
    accessToken = null;
  },
};
