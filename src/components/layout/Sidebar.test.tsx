import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useRequestStore } from "@/pages/request/requestStore";
import { useResponseStore } from "@/stores/responseStore";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue("pong"),
}));

function renderSidebar(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    useRequestStore.setState({
      openTabs: [],
      activeTabId: null,
      requests: {},
    });
    useResponseStore.setState({ responses: {} });
  });

  it("renders Requests header", () => {
    renderSidebar();
    expect(screen.getByText("Requests")).toBeInTheDocument();
  });

  it("shows empty state when no requests", () => {
    renderSidebar();
    expect(screen.getByText("No requests yet")).toBeInTheDocument();
  });

  it("creates request on + click and navigates", () => {
    renderSidebar();
    fireEvent.click(screen.getByTitle("New Request"));
    const { requests } = useRequestStore.getState();
    expect(Object.keys(requests)).toHaveLength(1);
  });

  it("lists requests from store", () => {
    const id1 = useRequestStore.getState().createRequest();
    const id2 = useRequestStore.getState().createRequest();
    useRequestStore.getState().updateRequest(id1, { url: "https://a.com/users" });
    useRequestStore.getState().updateRequest(id2, { url: "https://b.com/posts" });
    renderSidebar();
    expect(screen.getByText("GET /users")).toBeInTheDocument();
    expect(screen.getByText("GET /posts")).toBeInTheDocument();
  });

  it("deletes request on x click", () => {
    useRequestStore.getState().createRequest();
    const id2 = useRequestStore.getState().createRequest();
    renderSidebar();
    const deleteButtons = screen.getAllByTitle("Delete request");
    fireEvent.click(deleteButtons[0]);
    const { requests } = useRequestStore.getState();
    expect(Object.keys(requests)).toHaveLength(1);
    expect(requests[id2]).toBeDefined();
  });

  it("renders nav links", () => {
    renderSidebar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("Environments")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders API Studio header", () => {
    renderSidebar();
    expect(screen.getByText("API Studio")).toBeInTheDocument();
  });

  it("renders Workspace label", () => {
    renderSidebar();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });
});
