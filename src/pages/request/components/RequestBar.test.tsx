import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RequestBar } from "./RequestBar";
import type { RequestData } from "../requestStore";

function makeRequest(overrides: Partial<RequestData> = {}): RequestData {
  return {
    id: "test-id",
    name: "GET ",
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

describe("RequestBar", () => {
  const defaultProps = {
    onSend: vi.fn(),
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onSend.mockReset();
    defaultProps.onUpdate.mockReset();
  });

  it("renders method dropdown with GET", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    expect(screen.getByRole("button", { name: "GET" })).toBeInTheDocument();
  });

  it("renders URL input with placeholder", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Enter request URL"),
    ).toBeInTheDocument();
  });

  it("renders Send button", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("disables Send when URL is empty", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("enables Send when URL is provided", () => {
    render(
      <RequestBar
        request={makeRequest({ url: "https://example.com" })}
        {...defaultProps}
      />,
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  it("calls onUpdate when URL changes", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("Enter request URL"), {
      target: { value: "https://example.com" },
    });
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({
      url: "https://example.com",
    });
  });

  it("calls onUpdate when method changes", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "GET" }));
    fireEvent.click(screen.getByRole("option", { name: "POST" }));
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ method: "POST" });
  });

  it("calls onSend on Ctrl+Enter", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(defaultProps.onSend).toHaveBeenCalled();
  });

  it("calls onSend on Cmd+Enter", () => {
    render(<RequestBar request={makeRequest()} {...defaultProps} />);
    fireEvent.keyDown(window, { key: "Enter", metaKey: true });
    expect(defaultProps.onSend).toHaveBeenCalled();
  });

  it("cleans up keydown listener on unmount", () => {
    const { unmount } = render(
      <RequestBar request={makeRequest()} {...defaultProps} />,
    );
    unmount();
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(defaultProps.onSend).not.toHaveBeenCalled();
  });
});
