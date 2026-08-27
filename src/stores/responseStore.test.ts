import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResponseStore } from "./responseStore";
import { useSettingsStore } from "./settingsStore";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

const mockInvoke = vi.mocked(invoke);

describe("useResponseStore", () => {
  beforeEach(() => {
    useResponseStore.setState({ responses: {} });
    useSettingsStore.setState({ timeout: 30 });
    mockInvoke.mockReset();
  });

  it("initializes with empty responses", () => {
    expect(useResponseStore.getState().responses).toEqual({});
  });

  it("sendRequest sets isLoading to true", () => {
    mockInvoke.mockImplementation(() => new Promise(() => {}));
    useResponseStore.getState().sendRequest("req1", {
      method: "GET",
      url: "https://example.com",
    });
    expect(useResponseStore.getState().responses.req1).toEqual({
      isLoading: true,
    });
  });

  it("sendRequest stores response on success", async () => {
    const mockResponse = {
      status: 200,
      headers: {},
      body: { type: "Text" as const, value: "ok" },
      time_ms: 42,
    };
    mockInvoke.mockResolvedValue(mockResponse);
    await useResponseStore.getState().sendRequest("req1", {
      method: "GET",
      url: "https://example.com",
    });
    const record = useResponseStore.getState().responses.req1;
    expect(record.response).toEqual(mockResponse);
    expect(record.isLoading).toBe(false);
    expect(record.error).toBeUndefined();
  });

  it("sendRequest stores error on failure", async () => {
    mockInvoke.mockRejectedValue({ kind: "timeout", message: "Timed out" });
    await useResponseStore.getState().sendRequest("req1", {
      method: "GET",
      url: "https://example.com",
    });
    const record = useResponseStore.getState().responses.req1;
    expect(record.error).toBeDefined();
    expect(record.error?.kind).toBe("timeout");
    expect(record.isLoading).toBe(false);
    expect(record.response).toBeUndefined();
  });

  it("getResponse returns record", async () => {
    mockInvoke.mockResolvedValue({
      status: 200,
      headers: {},
      body: { type: "Empty" as const },
      time_ms: 10,
    });
    await useResponseStore.getState().sendRequest("req1", {
      method: "GET",
      url: "https://example.com",
    });
    expect(useResponseStore.getState().getResponse("req1")).toBeDefined();
  });

  it("getResponse returns undefined for unknown id", () => {
    expect(useResponseStore.getState().getResponse("unknown")).toBeUndefined();
  });

  it("clearResponse removes record", async () => {
    mockInvoke.mockResolvedValue({
      status: 200,
      headers: {},
      body: { type: "Empty" as const },
      time_ms: 10,
    });
    await useResponseStore.getState().sendRequest("req1", {
      method: "GET",
      url: "https://example.com",
    });
    expect(useResponseStore.getState().getResponse("req1")).toBeDefined();
    useResponseStore.getState().clearResponse("req1");
    expect(useResponseStore.getState().getResponse("req1")).toBeUndefined();
  });

  it("uses timeout from settingsStore", async () => {
    useSettingsStore.setState({ timeout: 60 });
    mockInvoke.mockResolvedValue({
      status: 200,
      headers: {},
      body: { type: "Empty" as const },
      time_ms: 10,
    });
    await useResponseStore.getState().sendRequest("req1", {
      method: "GET",
      url: "https://example.com",
    });
    expect(mockInvoke).toHaveBeenCalledWith("send_request", {
      args: { method: "GET", url: "https://example.com", timeout_seconds: 60 },
    });
  });
});
