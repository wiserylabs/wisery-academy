import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { api } from "./api.js";

vi.mock("./api.js", () => ({
  api: {
    login: vi.fn(),
    signup: vi.fn(),
    me: vi.fn(),
    tracks: vi.fn(),
    files: vi.fn(),
    logout: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

async function fillAndSubmitLogin(email = "dana@wisery.test", password = "correct-horse-1") {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Work email"), email);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("logged out", () => {
  it("shows the sign-in form, not the portal", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Work email")).toBeInTheDocument();
    expect(screen.queryByText("Material tracks")).not.toBeInTheDocument();
  });

  it("on success, logs in, fetches the current user, and hands off to the Portal", async () => {
    api.login.mockResolvedValue({ access: "token" });
    api.me.mockResolvedValue({ email: "dana@wisery.test", full_name: "Dana Levi", role: "student" });
    api.tracks.mockResolvedValue([]);

    render(<App />);
    await fillAndSubmitLogin();

    await waitFor(() => expect(screen.getByText(/Dana Levi/)).toBeInTheDocument());
    expect(api.login).toHaveBeenCalledWith("dana@wisery.test", "correct-horse-1");
    expect(api.me).toHaveBeenCalled();
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
  it("signs out back to the login screen", async () => {
    api.login.mockResolvedValue({ access: "token" });
    api.me.mockResolvedValue({ email: "dana@wisery.test", full_name: "Dana Levi", role: "student" });
    api.tracks.mockResolvedValue([]);

    render(<App />);
    await fillAndSubmitLogin();
    await waitFor(() => expect(screen.getByText(/Dana Levi/)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(api.logout).toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Work email")).toBeInTheDocument();
  });
});
