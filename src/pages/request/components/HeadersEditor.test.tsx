import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeadersEditor } from "./HeadersEditor";
import type { RequestData } from "../requestStore";
import { version } from "../../../../package.json";

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
    activeEditorTab: "headers" as const,
    activeResponseTab: "body" as const,
    responseBodyMode: "pretty" as const,
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

  it("renders locked row with disabled inputs", () => {
    const request = makeRequest({
      headers: [
        {
          id: "1",
          key: "User-Agent",
          value: `api-studio/${version}`,
          enabled: true,
          locked: true,
        },
      ],
    });
    render(<HeadersEditor request={request} onUpdate={onUpdate} />);
    const keyInput = screen.getByDisplayValue("User-Agent");
    const valueInput = screen.getByDisplayValue(`api-studio/${version}`);
    expect(keyInput).toBeDisabled();
    expect(valueInput).toBeDisabled();
  });

  it("does not show delete button for locked row", () => {
    const request = makeRequest({
      headers: [
        {
          id: "1",
          key: "User-Agent",
          value: `api-studio/${version}`,
          enabled: true,
          locked: true,
        },
      ],
    });
    render(<HeadersEditor request={request} onUpdate={onUpdate} />);
    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });

  it("allows toggling locked row enabled state", () => {
    const request = makeRequest({
      headers: [
        {
          id: "1",
          key: "User-Agent",
          value: `api-studio/${version}`,
          enabled: true,
          locked: true,
        },
      ],
    });
    render(<HeadersEditor request={request} onUpdate={onUpdate} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onUpdate).toHaveBeenCalledWith({
      headers: [
        {
          id: "1",
          key: "User-Agent",
          value: `api-studio/${version}`,
          enabled: false,
          locked: true,
        },
      ],
    });
  });

  it("shows both locked and regular rows", () => {
    const request = makeRequest({
      headers: [
        {
          id: "1",
          key: "User-Agent",
          value: `api-studio/${version}`,
          enabled: true,
          locked: true,
        },
        {
          id: "2",
          key: "X-Custom",
          value: "test",
          enabled: true,
        },
      ],
    });
    render(<HeadersEditor request={request} onUpdate={onUpdate} />);
    expect(screen.getByDisplayValue("User-Agent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("X-Custom")).toBeInTheDocument();
    expect(screen.getAllByText("×")).toHaveLength(1);
  });
});
