import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { StatusBar } from "./StatusBar";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const mockInvoke = vi.mocked(
  (await import("@tauri-apps/api/core")).invoke,
);

describe("StatusBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockInvoke.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows Ready initially before ping resolves", () => {
    mockInvoke.mockImplementation(() => new Promise(() => {}));
    render(<StatusBar />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows version", () => {
    mockInvoke.mockImplementation(() => new Promise(() => {}));
    render(<StatusBar />);
    expect(screen.getByText(/API Studio v/)).toBeInTheDocument();
  });

  it("shows Connected on ping success", async () => {
    mockInvoke.mockResolvedValue("pong");
    await act(async () => {
      render(<StatusBar />);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("shows Backend unreachable on ping failure", async () => {
    mockInvoke.mockRejectedValue(new Error("fail"));
    await act(async () => {
      render(<StatusBar />);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("Backend unreachable")).toBeInTheDocument();
  });

  it("re-checks health on interval", async () => {
    mockInvoke.mockResolvedValue("pong");
    await act(async () => {
      render(<StatusBar />);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockInvoke).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });

  it("cleans up interval on unmount", async () => {
    mockInvoke.mockResolvedValue("pong");
    await act(async () => {
      const { unmount } = render(<StatusBar />);
      await vi.advanceTimersByTimeAsync(0);
      unmount();
    });
    mockInvoke.mockClear();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});
