import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopBar } from "./TopBar";
import { useThemeStore } from "@/stores/themeStore";

describe("TopBar", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark", "light");
    useThemeStore.setState({ theme: "light" });
  });

  it("renders Projects heading", () => {
    render(<TopBar />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(<TopBar />);
    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("toggles theme on click", () => {
    render(<TopBar />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("shows moon icon in light mode", () => {
    render(<TopBar />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button.querySelector("path")).toBeInTheDocument();
  });

  it("shows sun icon in dark mode", () => {
    useThemeStore.setState({ theme: "dark" });
    render(<TopBar />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button.querySelector("circle")).toBeInTheDocument();
  });
});
