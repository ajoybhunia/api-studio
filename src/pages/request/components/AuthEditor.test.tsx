import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthEditor } from "./AuthEditor";
import type { RequestData } from "../requestStore";

function makeRequest(overrides: Partial<RequestData> = {}): RequestData {
  return {
    id: "test-id",
    name: "GET Test",
    method: "GET",
    url: "",
    headers: [],
    queryParams: [],
    auth: { type: "none", token: "", username: "", password: "" },
    body: { type: "none", content: "" },
    activeEditorTab: "auth",
    ...overrides,
  };
}

describe("AuthEditor", () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders auth type buttons", () => {
    render(<AuthEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByText("No Auth")).toBeInTheDocument();
    expect(screen.getByText("Bearer Token")).toBeInTheDocument();
    expect(screen.getByText("Basic Auth")).toBeInTheDocument();
  });

  it("shows no auth message when type is none", () => {
    render(<AuthEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(
      screen.getByText("No authentication configured"),
    ).toBeInTheDocument();
  });

  it("shows token input when bearer selected", () => {
    const request = makeRequest({
      auth: { type: "bearer", token: "abc", username: "", password: "" },
    });
    render(<AuthEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("Token")).toBeInTheDocument();
  });

  it("shows username/password when basic selected", () => {
    const request = makeRequest({
      auth: { type: "basic", token: "", username: "user", password: "pass" },
    });
    render(<AuthEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("updates auth type on click", () => {
    render(<AuthEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("Bearer Token"));
    expect(onUpdate).toHaveBeenCalledWith({
      auth: { type: "bearer", token: "", username: "", password: "" },
    });
  });
});
