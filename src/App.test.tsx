import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { useRequestStore } from "@/pages/request/requestStore";
import { useResponseStore } from "@/stores/responseStore";
import { useThemeStore } from "@/stores/themeStore";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue("pong"),
}));

vi.mock("@/components/layout/StatusBar", () => ({
  StatusBar: () => <footer>StatusBar Mock</footer>,
}));

function renderApp(hash = "#/") {
  window.location.hash = hash;
  return render(<App />);
}

describe("App", () => {
  beforeEach(() => {
    useRequestStore.setState({
      openTabs: [],
      activeTabId: null,
      requests: {},
    });
    useResponseStore.setState({ responses: {} });
    useThemeStore.setState({ theme: "light" });
    document.documentElement.classList.remove("dark");
    window.location.hash = "#/";
  });

  it("renders dashboard on root route", () => {
    renderApp("#/");
    expect(
      screen.getByRole("heading", { name: "Welcome to API Studio" }),
    ).toBeInTheDocument();
  });

  it("renders request page on /request/:id", () => {
    const id = useRequestStore.getState().createRequest();
    renderApp(`#/request/${id}`);
    expect(
      screen.getByPlaceholderText("Enter request URL"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("renders collections page", () => {
    renderApp("#/collections");
    expect(
      screen.getByRole("heading", { name: "Collections" }),
    ).toBeInTheDocument();
  });

  it("renders environments page", () => {
    renderApp("#/environments");
    expect(
      screen.getByRole("heading", { name: "Environments" }),
    ).toBeInTheDocument();
  });

  it("renders settings page", () => {
    renderApp("#/settings");
    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("falls back to dashboard for unknown routes", () => {
    renderApp("#/unknown");
    expect(
      screen.getByRole("heading", { name: "Welcome to API Studio" }),
    ).toBeInTheDocument();
  });

  it("initializes theme on mount", () => {
    window.localStorage.setItem("theme", "dark");
    renderApp("#/");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
