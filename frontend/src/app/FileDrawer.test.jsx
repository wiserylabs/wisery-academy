import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FileDrawer from "./FileDrawer.jsx";

const tracks = [{ id: "t1", title: "Hands-On Lab Guides" }];

function setup() {
  const actions = { upload: vi.fn(async () => {}), updateFile: vi.fn(async () => {}), closeModal: vi.fn() };
  const { container } = render(
    <FileDrawer modal={{ kind: "upload", trackId: "t1" }} tracks={tracks} actions={actions} />
  );
  const input = container.querySelector('input[type="file"]');
  const dropzone = container.querySelector(".dropzone");
  return { actions, input, dropzone };
}

describe("FileDrawer upload", () => {
  it("has a real file input inside the dropzone (click-to-browse works)", () => {
    const { input } = setup();
    expect(input).toBeTruthy();
  });

  it("selecting a file via the input shows its name", async () => {
    const { input } = setup();
    const file = new File(["hi"], "lab-11.pdf", { type: "application/pdf" });
    await userEvent.upload(input, file);
    expect(screen.getByText("lab-11.pdf")).toBeInTheDocument();
  });

  it("drag-and-drop populates the same file state", () => {
    const { dropzone } = setup();
    const file = new File(["hi"], "dropped.pdf", { type: "application/pdf" });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(screen.getByText("dropped.pdf")).toBeInTheDocument();
  });

  it("uploads the chosen file through the API on submit", async () => {
    const { actions, input } = setup();
    const file = new File(["hi"], "lab-11.pdf", { type: "application/pdf" });
    await userEvent.upload(input, file);
    await userEvent.type(screen.getByPlaceholderText(/Advanced correlation/), "Lab 11");
    await userEvent.click(screen.getByRole("button", { name: /Upload as draft/ }));
    expect(actions.upload).toHaveBeenCalledTimes(1);
    const [trackId, fields] = actions.upload.mock.calls[0];
    expect(trackId).toBe("t1");
    expect(fields.file).toBe(file);
  });
});
