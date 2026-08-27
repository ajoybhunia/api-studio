import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { DashboardPage } from "./DashboardPage";
import { useRequestStore } from "@/pages/request/requestStore";

function renderWithRouter(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/request/:id" element={<div>Request Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    useRequestStore.setState({
      openTabs: [],
      activeTabId: null,
      requests: {},
    });
  });

  it("renders welcome heading", () => {
    renderWithRouter();
    expect(
      screen.getByRole("heading", { name: "Welcome to API Studio" }),
    ).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    renderWithRouter();
    expect(
      screen.getByText("A lightweight, Git-friendly API development platform."),
    ).toBeInTheDocument();
  });

  it("renders New Request button", () => {
    renderWithRouter();
    expect(
      screen.getByRole("button", { name: "New Request" }),
    ).toBeInTheDocument();
  });

  it("renders Import Collection button", () => {
    renderWithRouter();
    expect(
      screen.getByRole("button", { name: "Import Collection" }),
    ).toBeInTheDocument();
  });

  it("renders help text", () => {
    renderWithRouter();
    expect(
      screen.getByText("Create a new request to get started."),
    ).toBeInTheDocument();
  });

  it("creates request and navigates on New Request click", () => {
    renderWithRouter();
    fireEvent.click(screen.getByRole("button", { name: "New Request" }));
    const { requests } = useRequestStore.getState();
    const ids = Object.keys(requests);
    expect(ids).toHaveLength(1);
    expect(screen.getByText("Request Page")).toBeInTheDocument();
  });
});
