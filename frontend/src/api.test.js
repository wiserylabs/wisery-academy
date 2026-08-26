import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api.js";

function mockFetchOnce({ ok = true, status = 200, body = {} }) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
  return global.fetch;
}

beforeEach(() => {
  // api.js holds the access token in module-level state, not React state --
  // reset it between tests the same way a fresh page load would.
  api.logout();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api.login", () => {
  it("posts credentials to /api/auth/login/", async () => {
    const fetchMock = mockFetchOnce({ body: { access: "access-token", refresh: "refresh-token" } });

    await api.login("dana@wisery.test", "correct-horse-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "dana@wisery.test", password: "correct-horse-1" }),
      })
    );
  });

  it("stores the access token and attaches it to later requests", async () => {
    mockFetchOnce({ body: { access: "access-token", refresh: "refresh-token" } });
    await api.login("dana@wisery.test", "correct-horse-1");

    const fetchMock = mockFetchOnce({ body: { email: "dana@wisery.test", role: "student" } });
    await api.me();

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer access-token");
  });
});

describe("api.logout", () => {
  it("clears the token so later requests go out unauthenticated", async () => {
    mockFetchOnce({ body: { access: "access-token", refresh: "refresh-token" } });
    await api.login("dana@wisery.test", "correct-horse-1");
    api.logout();

    const fetchMock = mockFetchOnce({ body: {} });
    await api.tracks();

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });
});

describe("request() error handling", () => {
  it("throws the server's detail message on a non-ok response", async () => {
    mockFetchOnce({ ok: false, status: 401, body: { detail: "No active account found with the given credentials" } });

    await expect(api.login("dana@wisery.test", "wrong-password")).rejects.toThrow(
      "No active account found with the given credentials"
    );
  });

  it("falls back to a generic message when the error body has no detail", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    });

    await expect(api.tracks()).rejects.toThrow("Request failed: 500");
  });

  it("returns null for a 204 response instead of parsing an empty body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error("no body to parse")),
    });

    await expect(api.tracks()).resolves.toBeNull();
  });
});

describe("api.tracks / api.files", () => {
  it("unwraps DRF's paginated {results: [...]} envelope into a plain array", async () => {
    mockFetchOnce({ body: { count: 2, next: null, previous: null, results: [{ id: 1 }, { id: 2 }] } });
    const tracks = await api.tracks();
    expect(tracks).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("requests files scoped to the given track", async () => {
    const fetchMock = mockFetchOnce({ body: { results: [] } });
    await api.files(7);
    expect(fetchMock).toHaveBeenCalledWith("/api/files/?track=7", expect.anything());
  });
});

describe("api.uploadFile", () => {
  it("sends a multipart FormData body and lets the browser set its own Content-Type", async () => {
    const fetchMock = mockFetchOnce({ status: 201, body: { id: "f-1" } });
    const file = new File(["bytes"], "day1.pptx");

    await api.uploadFile({ track: 1, title: "Day 1 deck", visibility: "all", file });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/files/");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("title")).toBe("Day 1 deck");
    expect(options.body.get("file")).toBe(file);
    // The critical assertion: no Content-Type header. Setting one manually
    // strips the multipart boundary the browser would otherwise add,
    // which silently breaks the upload server-side.
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("omits empty/undefined fields instead of sending them as the literal string \"undefined\"", async () => {
    const fetchMock = mockFetchOnce({ status: 201, body: { id: "f-1" } });
    await api.uploadFile({ track: 1, title: "Day 1 deck", annotation: "", file: new File(["x"], "x.pptx") });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.body.has("annotation")).toBe(false);
  });
});

describe("api.publishFile / api.deleteFile / api.markDownloaded", () => {
  it("hit the expected endpoints with the expected methods", async () => {
    // mockFetchOnce() replaces global.fetch with a brand-new mock each
    // call, so each assertion must grab that call's own return value --
    // reusing the first one would only ever see the first request.
    let fetchMock = mockFetchOnce({ body: {} });
    await api.publishFile("f-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/files/f-1/publish/", expect.objectContaining({ method: "POST" }));

    fetchMock = mockFetchOnce({ status: 204, body: {} });
    await api.deleteFile("f-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/files/f-1/", expect.objectContaining({ method: "DELETE" }));

    fetchMock = mockFetchOnce({ body: {} });
    await api.markDownloaded("f-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/files/f-1/mark_downloaded/",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("api.signup", () => {
  it("sends full_name under the snake_case field the API expects", async () => {
    const fetchMock = mockFetchOnce({ status: 201, body: { id: 1 } });

    await api.signup("dana@wisery.test", "correct-horse-1", "Dana Levi");

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      email: "dana@wisery.test",
      password: "correct-horse-1",
      full_name: "Dana Levi",
    });
  });
});
