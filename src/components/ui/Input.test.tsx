import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter URL" />);
    expect(screen.getByPlaceholderText("Enter URL")).toBeInTheDocument();
  });

  it("displays value", () => {
    render(<Input value="https://api.example.com" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("https://api.example.com");
  });

  it("calls onChange when value changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "test");
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("has autocomplete off by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("autocomplete", "off");
  });

  it("has spellCheck false by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("spellcheck", "false");
  });

  it("has autoCorrect off by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("autocorrect", "off");
  });

  it("has autoCapitalize off by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "autocapitalize",
      "off",
    );
  });

  it("is disabled when disabled is set", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
