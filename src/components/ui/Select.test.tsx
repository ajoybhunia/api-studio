import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui/Select";

describe("Select", () => {
  it("renders with options", () => {
    render(
      <Select>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays selected value", () => {
    render(
      <Select value="POST" onChange={vi.fn()}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveValue("POST");
  });

  it("calls onChange when value changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select onChange={onChange}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </Select>,
    );
    await user.selectOptions(screen.getByRole("combobox"), "POST");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(
      <Select className="custom-class">
        <option value="GET">GET</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveClass("custom-class");
  });

  it("is disabled when disabled is set", () => {
    render(
      <Select disabled>
        <option value="GET">GET</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(
      <Select ref={ref}>
        <option value="GET">GET</option>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});
