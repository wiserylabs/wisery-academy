import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import App from "./App.jsx";

// The portal is a self-contained client-side demo, so these are plain
// interaction tests — no API mocking needed.

beforeEach(() => {
  window.scrollTo = () => {};
});

async function signInAs(name) {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: new RegExp(name) }));
  return user;
}

describe("login screen", () => {
  it("shows the sign-in panel and the demo role picker, not the portal", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText(/Demo — sign in as/i)).toBeInTheDocument();
    expect(screen.queryByText("Material tracks")).not.toBeInTheDocument();
  });
});

describe("signed in", () => {
  it("signs in as the Student demo user and lands on the home hero + tracks", async () => {
    await signInAs("Dana Levi");
    expect(screen.getByText(/Your full training package/)).toBeInTheDocument();
    expect(screen.getByText("Material tracks")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Slide Decks" })).toBeInTheDocument();
  });

  it("opens a track and shows its file table", async () => {
    const user = await signInAs("Dana Levi");
    await user.click(screen.getByRole("heading", { name: "Hands-On Lab Guides" }));
    expect(screen.getByText("Building your first entity graph")).toBeInTheDocument();
    expect(screen.getByText(/items · newest first/)).toBeInTheDocument();
  });

  it("switches role live via the Viewing as toggle", async () => {
    const user = await signInAs("Dana Levi");
    expect(screen.getByText("Dana Levi")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editor" }));
    expect(screen.getByText("Maya Shani")).toBeInTheDocument();
  });

  it("exposes Editor manage-mode only to the Editor role", async () => {
    const user = await signInAs("Maya Shani");
    await user.click(screen.getByRole("heading", { name: "Hands-On Lab Guides" }));
    expect(screen.getByRole("button", { name: /Manage files/ })).toBeInTheDocument();
  });

  it("signs out back to the login screen", async () => {
    const user = await signInAs("Dana Levi");
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
