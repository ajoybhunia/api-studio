import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RequestPage } from "./RequestPage";
import { useRequestStore } from "./requestStore";
import { useResponseStore } from "@/stores/responseStore";

function renderWithRouter(ui: React.ReactElement, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/request/:id" element={ui} />
        <Route path="/" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequestPage", () => {
  beforeEach(() => {
    useRequestStore.setState({
      openTabs: [],
      activeTabId: null,
      requests: {},
    });
    useResponseStore.setState({ responses: {} });
  });

  it("shows empty state when no request ID matches", () => {
    renderWithRouter(<RequestPage />, "/request/non-existent");
    expect(screen.getByText("No request selected")).toBeInTheDocument();
    expect(screen.getByText("New Request")).toBeInTheDocument();
  });

  it("renders request editor when valid request ID", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    expect(screen.getByRole("button", { name: "GET" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter request URL"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("displays default GET method", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    expect(screen.getByRole("button", { name: "GET" })).toHaveTextContent(
      "GET",
    );
  });

  it("displays empty URL by default", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    const input = screen.getByPlaceholderText(
      "Enter request URL",
    ) as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("disables Send button when URL is empty", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("enables Send button when URL is provided", () => {
    const id = useRequestStore.getState().createRequest();
    useRequestStore
      .getState()
      .updateRequest(id, { url: "https://api.example.com" });
    renderWithRouter(<RequestPage />, `/request/${id}`);
    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  it("updates method in store when select changes", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    fireEvent.click(screen.getByRole("button", { name: "GET" }));
    fireEvent.click(screen.getByRole("option", { name: "POST" }));
    expect(useRequestStore.getState().requests[id].method).toBe("POST");
  });

  it("updates URL in store when input changes", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    const input = screen.getByPlaceholderText("Enter request URL");
    fireEvent.change(input, {
      target: { value: "https://api.example.com/users" },
    });
    expect(useRequestStore.getState().requests[id].url).toBe(
      "https://api.example.com/users",
    );
  });

  it("creates new request when clicking New Request in empty state", () => {
    renderWithRouter(<RequestPage />, "/request/non-existent");
    const button = screen.getByRole("button", { name: "New Request" });
    fireEvent.click(button);
    const { requests } = useRequestStore.getState();
    const ids = Object.keys(requests);
    expect(ids).toHaveLength(1);
  });

  it("renders editor tabs", () => {
    const id = useRequestStore.getState().createRequest();
    renderWithRouter(<RequestPage />, `/request/${id}`);
    expect(screen.getByRole("button", { name: "Params" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Body" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auth" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Headers" })).toBeInTheDocument();
  });

  it("triggers onSend on Ctrl+Enter", () => {
    const id = useRequestStore.getState().createRequest();
    useRequestStore
      .getState()
      .updateRequest(id, { url: "https://api.example.com" });
    const sendRequestSpy = vi
      .spyOn(useResponseStore.getState(), "sendRequest")
      .mockImplementation(() => Promise.resolve());
    renderWithRouter(<RequestPage />, `/request/${id}`);
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(sendRequestSpy).toHaveBeenCalledWith(id, {
      method: "GET",
      url: "https://api.example.com",
      headers: undefined,
      body: undefined,
    });
    sendRequestSpy.mockRestore();
  });

  it("sends request with query params merged into url", () => {
    const id = useRequestStore.getState().createRequest();
    useRequestStore
      .getState()
      .updateRequest(id, { url: "https://api.example.com/users" });
    useRequestStore.getState().updateRequest(id, {
      queryParams: [
        { id: "p1", key: "page", value: "1", enabled: true },
        { id: "p2", key: "limit", value: "10", enabled: true },
      ],
    });
    const sendRequestSpy = vi
      .spyOn(useResponseStore.getState(), "sendRequest")
      .mockImplementation(() => Promise.resolve());
    renderWithRouter(<RequestPage />, `/request/${id}`);
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(sendRequestSpy).toHaveBeenCalledWith(id, {
      method: "GET",
      url: "https://api.example.com/users?page=1&limit=10",
      headers: undefined,
      body: undefined,
    });
    sendRequestSpy.mockRestore();
  });

  it("sends request with enabled headers", () => {
    const id = useRequestStore.getState().createRequest();
    useRequestStore
      .getState()
      .updateRequest(id, { url: "https://api.example.com" });
    useRequestStore.getState().updateRequest(id, {
      headers: [
        { id: "h1", key: "X-Custom", value: "test", enabled: true },
        { id: "h2", key: "X-Disabled", value: "no", enabled: false },
      ],
    });
    const sendRequestSpy = vi
      .spyOn(useResponseStore.getState(), "sendRequest")
      .mockImplementation(() => Promise.resolve());
    renderWithRouter(<RequestPage />, `/request/${id}`);
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(sendRequestSpy).toHaveBeenCalledWith(id, {
      method: "GET",
      url: "https://api.example.com",
      headers: { "X-Custom": "test" },
      body: undefined,
    });
    sendRequestSpy.mockRestore();
  });

  it("sends request with bearer auth header", () => {
    const id = useRequestStore.getState().createRequest();
    useRequestStore
      .getState()
      .updateRequest(id, { url: "https://api.example.com" });
    useRequestStore.getState().updateRequest(id, {
      auth: { type: "bearer", token: "abc123", username: "", password: "" },
    });
    const sendRequestSpy = vi
      .spyOn(useResponseStore.getState(), "sendRequest")
      .mockImplementation(() => Promise.resolve());
    renderWithRouter(<RequestPage />, `/request/${id}`);
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(sendRequestSpy).toHaveBeenCalledWith(id, {
      method: "GET",
      url: "https://api.example.com",
      headers: { Authorization: "Bearer abc123" },
      body: undefined,
    });
    sendRequestSpy.mockRestore();
  });

  it("blocks send when json body is invalid", () => {
    const id = useRequestStore.getState().createRequest();
    useRequestStore
      .getState()
      .updateRequest(id, { url: "https://api.example.com" });
    useRequestStore.getState().updateRequest(id, {
      body: { type: "json", content: "{ invalid }" },
    });
    const sendRequestSpy = vi
      .spyOn(useResponseStore.getState(), "sendRequest")
      .mockImplementation(() => Promise.resolve());
    renderWithRouter(<RequestPage />, `/request/${id}`);
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(sendRequestSpy).not.toHaveBeenCalled();
    sendRequestSpy.mockRestore();
  });
});
