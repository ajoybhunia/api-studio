import { describe, expect, it } from "vitest";
import { AppError, toAppError } from "./errors";

describe("AppError", () => {
  it("creates an error with kind and message", () => {
    const err = new AppError("timeout", "Request timed out");
    expect(err.kind).toBe("timeout");
    expect(err.message).toBe("Request timed out");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("has a name property", () => {
    const err = new AppError("unknown", "fail");
    expect(err.name).toBe("AppError");
  });
});

describe("toAppError", () => {
  it("returns AppError as-is", () => {
    const input = new AppError("timeout", "too slow");
    expect(toAppError(input)).toBe(input);
  });

  it("converts object with kind and message", () => {
    const input = { kind: "connection", message: "refused" };
    const result = toAppError(input);
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("connection");
    expect(result.message).toBe("refused");
  });

  it("converts plain string", () => {
    const result = toAppError("something broke");
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("something broke");
  });

  it("converts Error instance", () => {
    const input = new TypeError("bad type");
    const result = toAppError(input);
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("bad type");
  });

  it("converts null", () => {
    const result = toAppError(null);
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("An unknown error occurred");
  });

  it("converts undefined", () => {
    const result = toAppError(undefined);
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("An unknown error occurred");
  });

  it("converts number", () => {
    const result = toAppError(42);
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("An unknown error occurred");
  });

  it("converts object with missing kind", () => {
    const input = { message: "partial" };
    const result = toAppError(input);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("An unknown error occurred");
  });

  it("converts object with missing message", () => {
    const input = { kind: "timeout" };
    const result = toAppError(input);
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("An unknown error occurred");
  });
});
