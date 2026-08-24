import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeadersEditor } from "./HeadersEditor";
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
    activeEditorTab: "headers",
    ...overrides,
  };
}

describe("HeadersEditor", () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no headers", () => {
    render(<HeadersEditor request={makeRequest()} onUpdate={onUpdate} />);
    expect(screen.getByText("No headers")).toBeInTheDocument();
  });

  it("renders existing headers", () => {
    const request = makeRequest({
      headers: [
        {
          id: "1",
          key: "Content-Type",
          value: "application/json",
          enabled: true,
        },
      ],
    });
    render(<HeadersEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue("Content-Type")).toBeInTheDocument();
    expect(screen.getByDisplayValue("application/json")).toBeInTheDocument();
  });

  it("adds new header row", () => {
    render(<HeadersEditor request={makeRequest()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("+ Add header"));
    expect(onUpdate).toHaveBeenCalledWith({
      headers: expect.arrayContaining([
        expect.objectContaining({ key: "", value: "", enabled: true }),
      ]),
    });
  });

  it("removes header row", () => {
    const request = makeRequest({
      headers: [{ id: "1", key: "X-Custom", value: "test", enabled: true }],
    });
    render(<HeadersEditor request={request} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("×"));
    expect(onUpdate).toHaveBeenCalledWith({ headers: [] });
  });
});
