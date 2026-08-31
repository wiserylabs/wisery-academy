import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { api } from "./api.js";

// The connected app talks to the API, so we mock api.js. The mock remembers
// which account "logged in" so api.me() returns the matching role.
const USERS = {
  "dana@wisery.ai": { id: 1, email: "dana@wisery.ai", full_name: "Dana Levi", role: "student" },
  "omer@wisery.ai": { id: 2, email: "omer@wisery.ai", full_name: "Omer Katz", role: "technical" },
  "maya@wisery.ai": { id: 3, email: "maya@wisery.ai", full_name: "Maya Shani", role: "editor" },
};

const TRACKS = [
  { id: "t1", slug: "slide-decks", title: "Slide Decks", description: "Instructor decks.", sort_order: 1, file_count: 2, published_count: 2, downloaded_count: 1, updated_at: "2026-08-18T00:00:00Z" },
  { id: "t2", slug: "lab-guides", title: "Hands-On Lab Guides", description: "Lab booklets.", sort_order: 2, file_count: 1, published_count: 1, downloaded_count: 0, updated_at: "2026-08-21T00:00:00Z" },
  { id: "tech", slug: "technical-section", title: "Technical Section", description: "Runbooks.", sort_order: 7, file_count: 0, published_count: 0, downloaded_count: 0, updated_at: null },
];

const FILES = {
  t2: [
    { id: "f1", track: "t2", title: "Building your first entity graph", version: "2.4.1", size_bytes: 19000000, mime_type: "application/pdf", visibility: "all", status: "published", annotation: "", download_url: "http://x/f1.pdf", downloaded: false, created_at: "2026-08-21T00:00:00Z", published_at: "2026-08-21T00:00:00Z" },
  ],
};

vi.mock("./api.js", () => {
  let current = null;
  return {
    api: {
      login: vi.fn(async (email) => { current = USERS[email] || { email, role: "student", full_name: email }; return { access: "t" }; }),
      me: vi.fn(async () => current),
      logout: vi.fn(() => { current = null; }),
      tracks: vi.fn(async () => TRACKS),
      files: vi.fn(async (id) => FILES[id] || []),
      uploadFile: vi.fn(async () => ({})),
      updateFile: vi.fn(async () => ({})),
      publishFile: vi.fn(async () => ({})),
      deleteFile: vi.fn(async () => null),
      markDownloaded: vi.fn(async () => ({})),
    },
  };
});

beforeEach(() => { window.scrollTo = () => {}; });

async function loginAs(name) {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: new RegExp(name) }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "Material tracks" })).toBeInTheDocument());
  return user;
}

describe("login", () => {
  it("shows the sign-in panel and demo picker, not the portal", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText(/Demo — sign in as/i)).toBeInTheDocument();
    expect(screen.queryByText("Material tracks")).not.toBeInTheDocument();
  });
});

describe("connected portal", () => {
  it("signs in as Student and renders tracks from the API", async () => {
    await loginAs("Dana Levi");
    expect(screen.getByRole("heading", { name: "Slide Decks" })).toBeInTheDocument();
    expect(screen.getByText("Dana Levi")).toBeInTheDocument();
  });

  it("opens a track and lists its files from the API", async () => {
    const user = await loginAs("Dana Levi");
    await user.click(screen.getByRole("heading", { name: "Hands-On Lab Guides" }));
    expect(await screen.findByText("Building your first entity graph")).toBeInTheDocument();
  });

  it("signs in as a different role from the login picker", async () => {
    const user = await loginAs("Maya Shani");
    expect(screen.getByText("Maya Shani")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await user.click(screen.getByRole("button", { name: /Omer Katz/ }));
    await waitFor(() => expect(screen.getByText("Omer Katz")).toBeInTheDocument());
  });

  it("gives the Editor manage-mode with Add files inside a track", async () => {
    const user = await loginAs("Maya Shani");
    await user.click(screen.getByRole("heading", { name: "Hands-On Lab Guides" }));
    await user.click(await screen.findByRole("button", { name: /Manage files/ }));
    expect(screen.getByRole("button", { name: /Add files/ })).toBeInTheDocument();
  });

  it("lets an Editor mark a file as must-read", async () => {
    const user = await loginAs("Maya Shani");
    await user.click(screen.getByRole("heading", { name: "Hands-On Lab Guides" }));
    await user.click(await screen.findByRole("button", { name: /Manage files/ }));
    await user.click(screen.getByRole("button", { name: "Mark as must-read" }));
    expect(api.updateFile).toHaveBeenCalledWith("f1", { must_read: true });
  });

  it("signs out back to the login screen", async () => {
    const user = await loginAs("Dana Levi");
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
