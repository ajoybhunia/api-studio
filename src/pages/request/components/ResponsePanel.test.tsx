import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponsePanel } from "./ResponsePanel";
import type { ResponseRecord } from "@/stores/responseStore";
import { AppError } from "@/lib/errors";

vi.mock("prism-react-renderer", () => ({
  Highlight: ({
    code,
    children,
  }: {
    code: string;
    children: (props: {
      tokens: string[][][];
      getLineProps: (args: { line: string[] }) => Record<string, unknown>;
      getTokenProps: (args: { token: string }) => Record<string, unknown>;
    }) => React.ReactNode;
  }) => {
    const tokens = code.split("\n").map((line) => [[line]]);
    return children({
      tokens,
      getLineProps: () => ({}),
      getTokenProps: ({ token }: { token: string }) => ({ children: token }),
    });
  },
  themes: { vsDark: {}, vsLight: {} },
}));

describe("ResponsePanel", () => {
  it("shows empty state when no record", () => {
    render(<ResponsePanel />);
    expect(
      screen.getByText("Send a request to see the response"),
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    const record: ResponseRecord = { isLoading: true };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("Sending request...")).toBeInTheDocument();
  });

  it("shows error with timeout icon", () => {
    const record: ResponseRecord = {
      isLoading: false,
      error: new AppError("timeout", "Request timed out"),
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("timeout")).toBeInTheDocument();
    expect(screen.getByText("Request timed out")).toBeInTheDocument();
  });

  it("shows error with connection icon", () => {
    const record: ResponseRecord = {
      isLoading: false,
      error: new AppError("connection", "Connection refused"),
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("connection")).toBeInTheDocument();
  });

  it("shows error with invalid_url icon", () => {
    const record: ResponseRecord = {
      isLoading: false,
      error: new AppError("invalid_url", "Invalid URL"),
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("invalid url")).toBeInTheDocument();
  });

  it("shows error with tls icon", () => {
    const record: ResponseRecord = {
      isLoading: false,
      error: new AppError("tls", "TLS error"),
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("tls")).toBeInTheDocument();
  });

  it("formats snake_case kind to words", () => {
    const record: ResponseRecord = {
      isLoading: false,
      error: new AppError("invalid_url", "Bad URL"),
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("invalid url")).toBeInTheDocument();
  });

  it("shows response status code", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("applies green color for 2xx status", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("200")).toHaveClass("text-green-500");
  });

  it("applies red color for 5xx status", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 500,
        headers: {},
        body: { type: "Text", value: "error" },
        time_ms: 100,
        ttfb_ms: 50,
        size_bytes: 5,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("500")).toHaveClass("text-red-500");
  });

  it("shows response time", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("42ms")).toBeInTheDocument();
  });

  it("shows Body and Headers tabs", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Headers")).toBeInTheDocument();
  });

  it("defaults to Body tab active", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    render(<ResponsePanel record={record} />);
    const bodyTab = screen.getByText("Body");
    expect(bodyTab).toHaveClass("border-foreground");
  });

  it("switches to Headers tab on click", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    const onTabChange = vi.fn();
    render(
      <ResponsePanel
        record={record}
        activeResponseTab="body"
        onActiveResponseTabChange={onTabChange}
      />,
    );
    fireEvent.click(screen.getByText("Headers"));
    expect(onTabChange).toHaveBeenCalledWith("headers");
  });

  it("headers tab shows response headers", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Request-Id": "abc" },
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    render(<ResponsePanel record={record} activeResponseTab="headers" />);
    expect(screen.getByText("Content-Type")).toBeInTheDocument();
    expect(screen.getByText("application/json")).toBeInTheDocument();
    expect(screen.getByText("X-Request-Id")).toBeInTheDocument();
    expect(screen.getByText("abc")).toBeInTheDocument();
  });

  it("headers tab shows empty message when no headers", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 204,
        headers: {},
        body: { type: "Empty" },
        time_ms: 5,
        ttfb_ms: 3,
        size_bytes: 0,
      },
    };
    render(<ResponsePanel record={record} activeResponseTab="headers" />);
    expect(screen.getByText("No response headers")).toBeInTheDocument();
  });

  it("body tab shows raw text in raw mode", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "hello world" },
        time_ms: 10,
        ttfb_ms: 5,
        size_bytes: 11,
      },
    };
    render(<ResponsePanel record={record} responseBodyMode="raw" />);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("body tab shows pretty JSON in pretty mode", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Json", value: { name: "test" } },
        time_ms: 10,
        ttfb_ms: 5,
        size_bytes: 17,
      },
    };
    render(<ResponsePanel record={record} responseBodyMode="pretty" />);
    expect(screen.getByText(/name/)).toBeInTheDocument();
  });

  it("raw/pretty toggle triggers callback", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 200,
        headers: {},
        body: { type: "Text", value: "ok" },
        time_ms: 42,
        ttfb_ms: 10,
        size_bytes: 2,
      },
    };
    const onModeChange = vi.fn();
    render(
      <ResponsePanel
        record={record}
        responseBodyMode="raw"
        onResponseBodyModeChange={onModeChange}
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onModeChange).toHaveBeenCalledWith("pretty");
  });

  it("shows context-aware empty body message for 204", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 204,
        headers: {},
        body: { type: "Empty" },
        time_ms: 5,
        ttfb_ms: 3,
        size_bytes: 0,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(
      screen.getByText("204 No Content — no body expected"),
    ).toBeInTheDocument();
  });

  it("shows context-aware empty body message for 304", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 304,
        headers: {},
        body: { type: "Empty" },
        time_ms: 5,
        ttfb_ms: 3,
        size_bytes: 0,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("304 Not Modified — no body")).toBeInTheDocument();
  });

  it("hides Pretty toggle on empty body", () => {
    const record: ResponseRecord = {
      isLoading: false,
      response: {
        status: 204,
        headers: {},
        body: { type: "Empty" },
        time_ms: 5,
        ttfb_ms: 3,
        size_bytes: 0,
      },
    };
    render(<ResponsePanel record={record} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
