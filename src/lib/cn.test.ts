import { describe, it, expect } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins string values with spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values but preserves 0", () => {
    expect(cn("a", "", null, undefined, false, "b")).toBe("a b");
    expect(cn("a", 0, "b")).toBe("a 0 b");
  });

  it("handles object conditionals", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens nested arrays", () => {
    expect(cn(["a", ["b", ["c"]]])).toBe("a b c");
  });
});
