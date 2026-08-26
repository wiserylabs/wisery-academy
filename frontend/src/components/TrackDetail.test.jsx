import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api.js";
import TrackDetail from "./TrackDetail.jsx";

vi.mock("../api.js", () => ({
  api: {
    files: vi.fn(),
    uploadFile: vi.fn(),
    updateFile: vi.fn(),
    publishFile: vi.fn(),
    deleteFile: vi.fn(),
    markDownloaded: vi.fn(),
  },
}));

const TRACK = { id: 1, slug: "slide-decks", title: "Slide Decks", description: "Instructor decks" };

const DRAFT_FILE = {
  id: "f-1",
  title: "Day 4 deck",
  version: "2.4.2",
  status: "draft",
  visibility: "all",
  size_bytes: 50 * 1024 * 1024,
  download_url: null,
  annotation: "",
};

const PUBLISHED_FILE = {
  id: "f-2",
  title: "Day 1 deck",
  version: "2.4.1",
  status: "published",
  visibility: "all",
  size_bytes: 96 * 1024 * 1024,
  download_url: "https://storage.example/day1.pptx?sig=abc",
  annotation: "Covers architecture and the data model.",
};

const STUDENT = { email: "dana@wisery.test", role: "student" };
const EDITOR = { email: "maya@wisery.test", role: "editor" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("as a Student (read-only)", () => {
  it("shows files with a download link, but no status/visibility columns or manage tools", async () => {
    api.files.mockResolvedValue([PUBLISHED_FILE]);
    render(<TrackDetail track={TRACK} user={STUDENT} onBack={vi.fn()} />);

    expect(await screen.findByText("Day 1 deck")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", PUBLISHED_FILE.download_url);
    expect(screen.queryByText("Manage files")).not.toBeInTheDocument();
    expect(screen.queryByText("Published")).not.toBeInTheDocument(); // status pill is editor-only
  });

  it("shows 'Draft' instead of a download link for an unpublished file, and never calls markDownloaded", async () => {
    api.files.mockResolvedValue([DRAFT_FILE]);
    render(<TrackDetail track={TRACK} user={STUDENT} onBack={vi.fn()} />);

    expect(await screen.findByText("Day 4 deck")).toBeInTheDocument();
    expect(screen.getByText("Not published")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Download" })).not.toBeInTheDocument();
  });

  it("records a download via markDownloaded when the link is clicked", async () => {
    api.files.mockResolvedValue([PUBLISHED_FILE]);
    api.markDownloaded.mockResolvedValue(null);
    render(<TrackDetail track={TRACK} user={STUDENT} onBack={vi.fn()} />);

    const user = userEvent.setup();
    const link = await screen.findByRole("link", { name: "Download" });
    await user.click(link);

    expect(api.markDownloaded).toHaveBeenCalledWith("f-2");
  });
});

describe("as an Editor", () => {
  it("shows status and visibility pills, and the manage bar", async () => {
    api.files.mockResolvedValue([DRAFT_FILE, PUBLISHED_FILE]);
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    expect(await screen.findByText("Manage files")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("Manage files reveals Publish/Edit/Delete, only Publish for a draft", async () => {
    api.files.mockResolvedValue([DRAFT_FILE, PUBLISHED_FILE]);
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    const user = userEvent.setup();
    await screen.findByText("Day 4 deck");
    await user.click(screen.getByText("Manage files"));

    const draftRow = screen.getByText("Day 4 deck").closest("tr");
    const publishedRow = screen.getByText("Day 1 deck").closest("tr");

    expect(within(draftRow).getByRole("button", { name: "Publish" })).toBeInTheDocument();
    expect(within(publishedRow).queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
    expect(within(draftRow).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(within(draftRow).getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("Publish calls the API and reloads the file list", async () => {
    api.files.mockResolvedValueOnce([DRAFT_FILE]).mockResolvedValueOnce([{ ...DRAFT_FILE, status: "published" }]);
    api.publishFile.mockResolvedValue({ ...DRAFT_FILE, status: "published" });
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    const user = userEvent.setup();
    await screen.findByText("Day 4 deck");
    await user.click(screen.getByText("Manage files"));
    await user.click(screen.getByRole("button", { name: "Publish" }));

    expect(api.publishFile).toHaveBeenCalledWith("f-1");
    await waitFor(() => expect(api.files).toHaveBeenCalledTimes(2));
  });

  it("Delete asks for confirmation, then calls the API and reloads", async () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    api.files.mockResolvedValueOnce([PUBLISHED_FILE]).mockResolvedValueOnce([]);
    api.deleteFile.mockResolvedValue(null);
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    const user = userEvent.setup();
    await screen.findByText("Day 1 deck");
    await user.click(screen.getByText("Manage files"));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(api.deleteFile).toHaveBeenCalledWith("f-2");
    await waitFor(() => expect(api.files).toHaveBeenCalledTimes(2));
    vi.unstubAllGlobals();
  });

  it("Delete does nothing if the confirmation is declined", async () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    api.files.mockResolvedValue([PUBLISHED_FILE]);
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    const user = userEvent.setup();
    await screen.findByText("Day 1 deck");
    await user.click(screen.getByText("Manage files"));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(api.deleteFile).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("+ Add files uploads a new draft with the chosen visibility, as multipart form data", async () => {
    api.files.mockResolvedValue([]);
    api.uploadFile.mockResolvedValue({ ...DRAFT_FILE, id: "f-3" });
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    const user = userEvent.setup();
    await waitFor(() => expect(screen.getByText("No files yet.")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "+ Add files" }));

    const file = new File(["deck bytes"], "day5.pptx", { type: "application/octet-stream" });
    // The dropzone's <input type="file"> is visually hidden (display:none)
    // via CSS, not disabled, so user-event can still target it directly.
    await user.upload(document.querySelector('input[type="file"]'), file);

    await user.type(screen.getByLabelText("Title"), "Day 5 deck");
    await user.click(screen.getByLabelText("Technical +"));
    await user.click(screen.getByRole("button", { name: "Upload as draft" }));

    await waitFor(() => expect(api.uploadFile).toHaveBeenCalled());
    const sentFields = api.uploadFile.mock.calls[0][0];
    expect(sentFields.title).toBe("Day 5 deck");
    expect(sentFields.visibility).toBe("technical_plus");
    expect(sentFields.track).toBe(1);
    expect(sentFields.file).toBeInstanceOf(File);
  });

  it("Edit pre-fills the form and calls updateFile without re-uploading a file", async () => {
    api.files.mockResolvedValue([PUBLISHED_FILE]);
    api.updateFile.mockResolvedValue({ ...PUBLISHED_FILE, annotation: "Now with speaker notes." });
    render(<TrackDetail track={TRACK} user={EDITOR} onBack={vi.fn()} />);

    const user = userEvent.setup();
    await screen.findByText("Day 1 deck");
    await user.click(screen.getByText("Manage files"));
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByLabelText("Title")).toHaveValue("Day 1 deck");
    expect(screen.queryByText(/Drop a file here/)).not.toBeInTheDocument(); // no file picker in edit mode

    await user.clear(screen.getByLabelText("Annotation (optional)"));
    await user.type(screen.getByLabelText("Annotation (optional)"), "Now with speaker notes.");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(api.updateFile).toHaveBeenCalledWith("f-2", expect.objectContaining({
      annotation: "Now with speaker notes.",
    })));
  });
});
