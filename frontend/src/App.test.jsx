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

// Slide Decks: both must-read files were downloaded, but an Editor has marked
// only one completed -- so progress must read "1 of 2", not "2 of 2".
const TRACKS = [
  { id: "t1", slug: "slide-decks", title: "Slide Decks", description: "Instructor decks.", sort_order: 1, file_count: 2, published_count: 2, downloaded_count: 2, completed_count: 1, must_read_count: 2, must_read_downloaded_count: 2, must_read_completed_count: 1, updated_at: "2026-08-18T00:00:00Z" },
  { id: "t2", slug: "lab-guides", title: "Hands-On Lab Guides", description: "Lab booklets.", sort_order: 2, file_count: 1, published_count: 1, downloaded_count: 0, completed_count: 1, updated_at: "2026-08-21T00:00:00Z" },
  { id: "tech", slug: "technical-section", title: "Technical Section", description: "Runbooks.", sort_order: 7, file_count: 0, published_count: 0, downloaded_count: 0, updated_at: null },
];

const FILES = {
  t2: [
    { id: "f1", track: "t2", title: "Building your first entity graph", version: "2.4.1", size_bytes: 19000000, mime_type: "application/pdf", visibility: "all", status: "published", annotation: "", download_url: "http://x/f1.pdf", downloaded: false, completed: true, created_at: "2026-08-21T00:00:00Z", published_at: "2026-08-21T00:00:00Z" },
  ],
};

const LEARNER_ITEM = {
  file: "f1", title: "Building your first entity graph", version: "2.4.1", track: "t2",
  track_title: "Hands-On Lab Guides", completed_at: null, completed_by: null, downloaded: true,
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
      users: vi.fn(async () => [
        { id: 1, email: "dana@wisery.ai", full_name: "Dana Levi", role: "student" },
        { id: 3, email: "maya@wisery.ai", full_name: "Maya Shani", role: "editor" },
      ]),
      createUser: vi.fn(async () => ({})),
      updateUser: vi.fn(async () => ({})),
      deleteUser: vi.fn(async () => null),
      settings: vi.fn(async () => ({
        exam_opens_at: "2026-08-01", exam_closes_at: "2026-12-01",
        exam_track: "t1", exam_track_slug: "slide-decks", exam_track_title: "Slide Decks",
        exam_status: "open", exam_is_open: true,
      })),
      learnerProgress: vi.fn(async () => ({
        user: { id: 1, email: "dana@wisery.ai", full_name: "Dana Levi", role: "student" },
        completed: 0, total: 1, items: [{ ...LEARNER_ITEM, completed: false }],
      })),
      setLearnerCompletion: vi.fn(async (userId, fileId, completed) => ({
        user: { id: 1, email: "dana@wisery.ai", full_name: "Dana Levi", role: "student" },
        completed: completed ? 1 : 0, total: 1, items: [{ ...LEARNER_ITEM, completed }],
      })),
      updateSettings: vi.fn(async (f) => ({
        exam_opens_at: "2026-08-01", exam_closes_at: "2026-12-01", exam_track: "t1",
        exam_status: "open", exam_is_open: true, ...f,
      })),
    },
  };
});

beforeEach(() => { window.scrollTo = () => {}; });

const EMAIL_FOR = {
  "Dana Levi": "dana@wisery.ai",
  "Omer Katz": "omer@wisery.ai",
  "Maya Shani": "maya@wisery.ai",
};

async function loginAs(name) {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByPlaceholderText("name@organisation.gov"), EMAIL_FOR[name]);
  await user.type(screen.getByPlaceholderText("••••••••••"), "pw-12345678");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "Material tracks" })).toBeInTheDocument());
  return user;
}

describe("login", () => {
  it("shows the sign-in form and not the removed SSO / demo / forgot elements", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@organisation.gov")).toBeInTheDocument();
    expect(screen.queryByText(/Demo — sign in as/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Continue with corporate SSO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Forgot/i)).not.toBeInTheDocument();
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

  it("signs in via the form as the entered account", async () => {
    await loginAs("Omer Katz");
    expect(screen.getByText("Omer Katz")).toBeInTheDocument();
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

  it("shows the Users link only to Editors", async () => {
    await loginAs("Dana Levi");
    expect(screen.queryByRole("button", { name: "Users" })).not.toBeInTheDocument();
  });

  it("opens the user-management screen for an Editor and lists users", async () => {
    const user = await loginAs("Maya Shani");
    await user.click(screen.getByRole("button", { name: "Users" }));
    expect(await screen.findByRole("heading", { name: "User management" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("dana@wisery.ai")).toBeInTheDocument();
    expect(screen.getByDisplayValue("maya@wisery.ai")).toBeInTheDocument();
  });

  it("shows the certification exam as a link when open and navigates to its library", async () => {
    const user = await loginAs("Dana Levi");
    const examLink = await screen.findByRole("button", { name: /Certification exam/ });
    await user.click(examLink);
    expect(await screen.findByRole("button", { name: /All materials/ })).toBeInTheDocument();
  });

  it("counts only Editor-completed items in progress, not downloads", async () => {
    await loginAs("Dana Levi");
    // Both Slide Decks must-reads were downloaded, but only one was marked completed.
    const headline = await screen.findByText(/of 2 must-read files done/);
    expect(headline.previousSibling).toHaveTextContent("1");
    expect(screen.getByText("Required reading").nextSibling).toHaveTextContent("1/2");
  });

  it("shows a Completed mark on items an Editor completed for the learner", async () => {
    const user = await loginAs("Dana Levi");
    await user.click(screen.getByRole("heading", { name: "Hands-On Lab Guides" }));
    expect(await screen.findByText("Building your first entity graph")).toBeInTheDocument();
    expect(screen.getByTitle("Marked completed by an Editor")).toBeInTheDocument();
  });

  it("lets an Editor mark an item completed for a specific learner", async () => {
    const user = await loginAs("Maya Shani");
    await user.click(screen.getByRole("button", { name: "Users" }));
    await user.click(await screen.findByRole("button", { name: "Progress" }));
    const box = await screen.findByRole("checkbox", { name: "Mark Building your first entity graph completed" });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(api.setLearnerCompletion).toHaveBeenCalledWith(1, "f1", true);
    await waitFor(() => expect(box).toBeChecked());
  });

  it("lets an Editor edit the certification exam window", async () => {
    const user = await loginAs("Maya Shani");
    await user.click(await screen.findByRole("button", { name: "Edit exam window" }));
    expect(await screen.findByText(/Set the window when the exam is available/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() => expect(api.updateSettings).toHaveBeenCalled());
  });
});
