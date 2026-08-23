import { beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "@/stores/themeStore";

describe("useThemeStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark", "light");
    useThemeStore.setState({ theme: "light" });
  });

  it("defaults to light theme when no preference is stored", () => {
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("setTheme updates state and applies the class", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("toggleTheme switches between light and dark", () => {
    useThemeStore.getState().setTheme("light");
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
  });
});
