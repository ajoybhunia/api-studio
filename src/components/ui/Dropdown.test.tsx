import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dropdown } from "@/components/ui/Dropdown";

const OPTIONS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
];

describe("Dropdown", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with selected value", () => {
    render(<Dropdown options={OPTIONS} value="GET" onChange={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("GET");
  });

  it("opens dropdown when button is clicked", async () => {
    render(<Dropdown options={OPTIONS} value="GET" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all options in dropdown", async () => {
    render(<Dropdown options={OPTIONS} value="GET" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("option", { name: "GET" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "POST" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "PUT" })).toBeInTheDocument();
  });

  it("calls onChange when option is selected", async () => {
    const onChange = vi.fn();
    render(<Dropdown options={OPTIONS} value="GET" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "POST" }));
    expect(onChange).toHaveBeenCalledWith("POST");
  });

  it("closes dropdown after selection", async () => {
    render(<Dropdown options={OPTIONS} value="GET" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "POST" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", async () => {
    render(
      <div>
        <p>Outside</p>
        <Dropdown options={OPTIONS} value="GET" onChange={vi.fn()} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText("Outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape key", async () => {
    render(<Dropdown options={OPTIONS} value="GET" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("highlights selected option", async () => {
    render(<Dropdown options={OPTIONS} value="POST" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    const selectedOption = screen.getByRole("option", { name: "POST" });
    expect(selectedOption).toHaveAttribute("aria-selected", "true");
    expect(selectedOption).toHaveClass("bg-muted");
  });

  it("applies custom className", () => {
    render(
      <Dropdown
        options={OPTIONS}
        value="GET"
        onChange={vi.fn()}
        className="custom-class"
      />,
    );
    expect(screen.getByRole("button").parentElement).toHaveClass(
      "custom-class",
    );
  });
});
