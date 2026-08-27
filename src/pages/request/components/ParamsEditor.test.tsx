import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ParamsEditor } from "./ParamsEditor";
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

describe("ParamsEditor", () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no params", () => {
    render(<ParamsEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByText("No query parameters")).toBeInTheDocument();
  });

  it("renders existing params", () => {
    const request = makeRequest({
      queryParams: [{ id: "1", key: "page", value: "1", enabled: true }],
    });
    render(<ParamsEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue("page")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
  });

  it("adds new param row", () => {
    render(<ParamsEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("+ Add param"));
    expect(onUpdate).toHaveBeenCalledWith({
      queryParams: expect.arrayContaining([
        expect.objectContaining({ key: "", value: "", enabled: true }),
      ]),
    });
  });

  it("updates param key", () => {
    const request = makeRequest({
      queryParams: [{ id: "1", key: "", value: "", enabled: true }],
    });
    render(<ParamsEditor request={request} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByPlaceholderText("Key"), {
      target: { value: "page" },
    });
    expect(onUpdate).toHaveBeenCalledWith({
      queryParams: [{ id: "1", key: "page", value: "", enabled: true }],
    });
  });

  it("removes param row", () => {
    const request = makeRequest({
      queryParams: [{ id: "1", key: "page", value: "1", enabled: true }],
    });
    render(<ParamsEditor request={request} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("×"));
    expect(onUpdate).toHaveBeenCalledWith({ queryParams: [] });
  });
});
