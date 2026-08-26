const BASE = import.meta.env.VITE_API_URL || "/api";

let accessToken = null;

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
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
  tracks() {
    return request("/tracks/");
  },
  logout() {
    accessToken = null;
  },
};
