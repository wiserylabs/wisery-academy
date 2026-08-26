import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api.js";
import Portal from "./Portal.jsx";

vi.mock("../api.js", () => ({
  api: {
    tracks: vi.fn(),
    files: vi.fn(),
    logout: vi.fn(),
  },
}));

const TRACKS = [
  { id: 1, slug: "slide-decks", title: "Slide Decks", description: "Instructor decks", file_count: 5 },
  { id: 2, slug: "technical-section", title: "Technical Section", description: "Runbooks", file_count: 3 },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.files.mockResolvedValue([]);
});

describe("role-gated Technical Section", () => {
  it("hides the Technical Section card for a Student, even though it's in the API response", async () => {
    api.tracks.mockResolvedValue(TRACKS);
    render(<Portal user={{ email: "dana@wisery.test", role: "student" }} onLogout={vi.fn()} />);

    await waitFor(() => expect(screen.getByText("Slide Decks")).toBeInTheDocument());
    expect(screen.queryByText("Technical Section")).not.toBeInTheDocument();
  });

  it("shows the Technical Section card for a Technical user", async () => {
    api.tracks.mockResolvedValue(TRACKS);
    render(<Portal user={{ email: "omer@wisery.test", role: "technical" }} onLogout={vi.fn()} />);

    await waitFor(() => expect(screen.getByText("Technical Section")).toBeInTheDocument());
    expect(screen.getByText("Restricted")).toBeInTheDocument();
  });

  it("shows the Technical Section card for an Editor", async () => {
    api.tracks.mockResolvedValue(TRACKS);
    render(<Portal user={{ email: "maya@wisery.test", role: "editor" }} onLogout={vi.fn()} />);

    await waitFor(() => expect(screen.getByText("Technical Section")).toBeInTheDocument());
  });
});

describe("navigation", () => {
  it("opening a track shows its detail view, and back returns to the grid", async () => {
    api.tracks.mockResolvedValue(TRACKS);
    render(<Portal user={{ email: "dana@wisery.test", role: "student" }} onLogout={vi.fn()} />);

    const user = userEvent.setup();
    await waitFor(() => expect(screen.getByText("Slide Decks")).toBeInTheDocument());
    await user.click(screen.getByText("Slide Decks"));

    expect(await screen.findByText("← All materials")).toBeInTheDocument();
    expect(api.files).toHaveBeenCalledWith(1);

    await user.click(screen.getByText("← All materials"));
    expect(await screen.findByText("Material tracks")).toBeInTheDocument();
  });
});
