import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { api } from "./api.js";

vi.mock("./api.js", () => ({
  api: {
    login: vi.fn(),
    signup: vi.fn(),
    me: vi.fn(),
    tracks: vi.fn(),
    logout: vi.fn(),
  },
}));

async function fillAndSubmitLogin(email = "dana@wisery.test", password = "correct-horse-1") {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Work email"), email);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logged out", () => {
  it("shows the sign-in form, not the portal", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Work email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.queryByText("Material tracks")).not.toBeInTheDocument();
  });

  it("logs in, fetches the current user, then the tracks", async () => {
    api.login.mockResolvedValue({ access: "token" });
    api.me.mockResolvedValue({ email: "dana@wisery.test", full_name: "Dana Levi", role: "student" });
    api.tracks.mockResolvedValue([
      { id: 1, title: "Slide Decks", description: "Instructor decks", file_count: 5 },
    ]);

    render(<App />);
    await fillAndSubmitLogin();

    await waitFor(() => expect(screen.getByText("Material tracks")).toBeInTheDocument());
    expect(api.login).toHaveBeenCalledWith("dana@wisery.test", "correct-horse-1");
    expect(api.me).toHaveBeenCalled();
    expect(api.tracks).toHaveBeenCalled();
  });

  it("shows the server's error message and stays on the login screen when login fails", async () => {
    api.login.mockRejectedValue(new Error("No active account found with the given credentials"));

    render(<App />);
    await fillAndSubmitLogin("dana@wisery.test", "wrong-password");

    expect(await screen.findByText("No active account found with the given credentials")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Work email")).toBeInTheDocument();
    expect(api.me).not.toHaveBeenCalled();
  });
});

describe("logged in", () => {
  async function loginAs(user) {
    api.login.mockResolvedValue({ access: "token" });
    api.me.mockResolvedValue(user);
    api.tracks.mockResolvedValue([
      { id: 1, title: "Slide Decks", description: "Instructor decks", file_count: 5 },
      { id: 2, title: "Technical Section", description: "Runbooks", file_count: 3 },
    ]);
    render(<App />);
    await fillAndSubmitLogin();
    await waitFor(() => expect(screen.getByText("Material tracks")).toBeInTheDocument());
  }

  it("shows the Student role label", async () => {
    await loginAs({ email: "dana@wisery.test", full_name: "Dana Levi", role: "student" });
    expect(screen.getByText(/Student — read and download, no Technical Section/)).toBeInTheDocument();
  });

  it("shows the Editor role label for an editor", async () => {
    await loginAs({ email: "maya@wisery.test", full_name: "Maya Shani", role: "editor" });
    expect(screen.getByText(/Editor — add, delete and annotate all folders/)).toBeInTheDocument();
  });

  it("lists every track returned by the API, with file counts", async () => {
    await loginAs({ email: "dana@wisery.test", full_name: "Dana Levi", role: "student" });
    expect(screen.getByText("Slide Decks")).toBeInTheDocument();
    expect(screen.getByText(/5 files/)).toBeInTheDocument();
    expect(screen.getByText("Technical Section")).toBeInTheDocument();
  });

  it("signs out back to the login screen and clears the token", async () => {
    await loginAs({ email: "dana@wisery.test", full_name: "Dana Levi", role: "student" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(api.logout).toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Work email")).toBeInTheDocument();
    expect(screen.queryByText("Material tracks")).not.toBeInTheDocument();
  });
});
