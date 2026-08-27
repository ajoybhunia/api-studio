import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BodyEditor } from "./BodyEditor";
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
    activeEditorTab: "body",
    ...overrides,
  };
}

describe("BodyEditor", () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders body type buttons", () => {
    render(<BodyEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.getByText("Raw")).toBeInTheDocument();
    expect(screen.getByText("JSON")).toBeInTheDocument();
  });

  it("shows no body message when type is none", () => {
    render(<BodyEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByText("No body")).toBeInTheDocument();
  });

  it("shows textarea when raw selected", () => {
    const request = makeRequest({
      body: { type: "raw", content: "hello" },
    });
    render(<BodyEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
  });

  it("shows textarea when json selected", () => {
    const request = makeRequest({
      body: { type: "json", content: '{"key": "value"}' },
    });
    render(<BodyEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue('{"key": "value"}')).toBeInTheDocument();
  });

  it("shows error for invalid json", () => {
    const request = makeRequest({
      body: { type: "json", content: "{ invalid }" },
    });
    render(<BodyEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
  });

  it("updates body type on click", () => {
    render(<BodyEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("Raw"));
    expect(onUpdate).toHaveBeenCalledWith({
      body: { type: "raw", content: "" },
    });
  });
});
