import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResponsePanel } from "./ResponsePanel";
import type { ResponseRecord } from "@/stores/responseStore";
import { AppError } from "@/lib/errors";

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

  it("formats JSON body", () => {
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
    render(<ResponsePanel record={record} />);
    expect(screen.getByText(/"name": "test"/)).toBeInTheDocument();
  });

  it("displays text body as-is", () => {
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
    render(<ResponsePanel record={record} />);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("handles empty body", () => {
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
    expect(screen.getByText("204")).toBeInTheDocument();
  });
});
