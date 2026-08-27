import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./AppShell";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { useRequestStore } from "@/pages/request/requestStore";
import { useResponseStore } from "@/stores/responseStore";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue("pong"),
}));

vi.mock("@/components/layout/StatusBar", () => ({
  StatusBar: () => <footer>StatusBar Mock</footer>,
}));

describe("AppShell", () => {
  beforeEach(() => {
    useRequestStore.setState({
      openTabs: [],
      activeTabId: null,
      requests: {},
    });
    useResponseStore.setState({ responses: {} });
  });

  it("renders TopBar with Projects heading", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders Sidebar with Requests label", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText("Requests")).toBeInTheDocument();
  });

  it("renders StatusBar", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText("StatusBar Mock")).toBeInTheDocument();
  });

  it("renders child route content via Outlet", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Welcome to API Studio" }),
    ).toBeInTheDocument();
  });
});
