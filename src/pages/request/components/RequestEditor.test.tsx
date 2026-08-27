import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RequestEditor } from "./RequestEditor";
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
    activeEditorTab: "params",
    ...overrides,
  };
}

describe("RequestEditor", () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all tab buttons", () => {
    render(<RequestEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByRole("button", { name: "Params" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Body" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auth" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Headers" })).toBeInTheDocument();
  });

  it("shows params editor by default", () => {
    render(<RequestEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByText("No query parameters")).toBeInTheDocument();
  });

  it("switches to body tab on click", () => {
    render(<RequestEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Body" }));
    expect(onUpdate).toHaveBeenCalledWith({ activeEditorTab: "body" });
  });

  it("switches to auth tab on click", () => {
    render(<RequestEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Auth" }));
    expect(onUpdate).toHaveBeenCalledWith({ activeEditorTab: "auth" });
  });

  it("switches to headers tab on click", () => {
    render(<RequestEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Headers" }));
    expect(onUpdate).toHaveBeenCalledWith({ activeEditorTab: "headers" });
  });

  it("renders active tab content", () => {
    const request = makeRequest({ activeEditorTab: "body" });
    render(<RequestEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByText("No body")).toBeInTheDocument();
  });
});
