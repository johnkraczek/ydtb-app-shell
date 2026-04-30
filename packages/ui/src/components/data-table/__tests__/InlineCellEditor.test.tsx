import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InlineCellEditor } from "../InlineCellEditor"
import type { FieldType, FieldOption } from "../InlineCellEditor"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal field descriptor for tests. */
function makeField(
  overrides: Partial<{
    id: string
    name: string
    type: FieldType
    options: FieldOption[]
  }> = {},
) {
  return {
    id: overrides.id ?? "f1",
    name: overrides.name ?? "Test Field",
    type: overrides.type ?? ("text" as FieldType),
    options: overrides.options,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("InlineCellEditor", () => {
  // -------------------------------------------------------------------------
  // 1. Click to edit (text)
  // -------------------------------------------------------------------------
  it("enters edit mode when the cell is clicked (text field)", async () => {
    const onChange = vi.fn()
    render(
      <InlineCellEditor
        field={makeField({ type: "text" as FieldType })}
        value="hello"
        onChange={onChange}
      />,
    )

    // In display mode, the value should be visible
    expect(screen.getByText("hello")).toBeInTheDocument()

    // Click to enter edit mode
    await userEvent.click(screen.getByText("hello"))

    // An input should appear with the current value
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe("hello")
  })

  // -------------------------------------------------------------------------
  // 2. Commit on blur
  // -------------------------------------------------------------------------
  it("commits the value when the input is blurred", async () => {
    const changedValues: string[] = []
    render(
      <InlineCellEditor
        field={makeField({ type: "text" as FieldType })}
        value="hello"
        onChange={(value) => {
          changedValues.push(value)
        }}
      />,
    )

    // Enter edit mode
    await userEvent.click(screen.getByText("hello"))

    const input = screen.getByRole("textbox") as HTMLInputElement

    // Clear and type a new value
    await userEvent.clear(input)
    await userEvent.type(input, "world")

    // Blur the input to commit
    fireEvent.blur(input)

    expect(changedValues).not.toHaveLength(0)
    expect(changedValues.at(-1)).toBe("world")
  })

  // -------------------------------------------------------------------------
  // 3. Commit on Enter
  // -------------------------------------------------------------------------
  it("commits the value when Enter is pressed", async () => {
    const changedValues: string[] = []
    render(
      <InlineCellEditor
        field={makeField({ type: "text" as FieldType })}
        value="hello"
        onChange={(value) => {
          changedValues.push(value)
        }}
      />,
    )

    // Enter edit mode
    await userEvent.click(screen.getByText("hello"))

    const input = screen.getByRole("textbox") as HTMLInputElement

    // Clear and type a new value, then press Enter
    await userEvent.clear(input)
    await userEvent.type(input, "world{Enter}")

    expect(changedValues).toEqual(["world"])
  })

  // -------------------------------------------------------------------------
  // 4. Cancel on Escape
  // -------------------------------------------------------------------------
  it("reverts to original value on Escape without calling onChange", async () => {
    const changedValues: string[] = []
    render(
      <InlineCellEditor
        field={makeField({ type: "text" as FieldType })}
        value="hello"
        onChange={(value) => {
          changedValues.push(value)
        }}
      />,
    )

    // Enter edit mode
    await userEvent.click(screen.getByText("hello"))

    const input = screen.getByRole("textbox") as HTMLInputElement

    // Change the value then press Escape
    await userEvent.clear(input)
    await userEvent.type(input, "world{Escape}")

    // onChange should NOT have been called
    expect(changedValues).toEqual([])

    // Should revert to displaying the original value
    expect(screen.getByText("hello")).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // 5. Text field renders
  // -------------------------------------------------------------------------
  it("displays value in display mode for a text field", () => {
    const onChange = vi.fn()
    render(
      <InlineCellEditor
        field={makeField({ id: "f1", name: "Name", type: "text" as FieldType })}
        value="hi"
        onChange={onChange}
      />,
    )

    expect(screen.getByText("hi")).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // 6. Number field renders
  // -------------------------------------------------------------------------
  it("displays value in display mode for a number field and shows number input in edit mode", async () => {
    const onChange = vi.fn()
    render(
      <InlineCellEditor
        field={makeField({ type: "number" as FieldType })}
        value="42"
        onChange={onChange}
      />,
    )

    // Display mode shows the number
    expect(screen.getByText("42")).toBeInTheDocument()

    // Click to enter edit mode
    await userEvent.click(screen.getByText("42"))

    // Should render a number input
    const input = screen.getByRole("spinbutton") as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.type).toBe("number")
    expect(input.value).toBe("42")
  })

  // -------------------------------------------------------------------------
  // 7. Date field renders
  // -------------------------------------------------------------------------
  it("displays formatted date with CalendarIcon for a date field", () => {
    const onChange = vi.fn()
    render(
      <InlineCellEditor
        field={makeField({ type: "date" as FieldType })}
        value="2026-01-15T00:00:00.000Z"
        onChange={onChange}
      />,
    )

    // The date should be displayed in a localized format
    const dateStr = new Date("2026-01-15T00:00:00.000Z").toLocaleDateString()
    expect(screen.getByText(dateStr)).toBeInTheDocument()

    // A CalendarIcon should be rendered (lucide-react renders SVGs)
    // The button container should contain an SVG element
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
    const svg = button.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // 8. Dropdown field renders
  // -------------------------------------------------------------------------
  it("displays selected option label for a dropdown field", () => {
    const onChange = vi.fn()
    const options: FieldOption[] = [{ value: "a", label: "Option A", color: null }]

    render(
      <InlineCellEditor
        field={makeField({ type: "dropdown" as FieldType, options })}
        value="a"
        onChange={onChange}
      />,
    )

    expect(screen.getByText("Option A")).toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // 9. Labels field renders
  // -------------------------------------------------------------------------
  it("displays colored badge for a labels field", () => {
    const onChange = vi.fn()
    const options: FieldOption[] = [{ value: "a", label: "Tag A", color: "#ff0000" }]

    render(
      <InlineCellEditor
        field={makeField({ type: "labels" as FieldType, options })}
        value='["a"]'
        onChange={onChange}
      />,
    )

    // The label badge should be visible
    const badge = screen.getByText("Tag A")
    expect(badge).toBeInTheDocument()

    // The badge should have the color applied as a background
    expect(badge).toHaveStyle({ backgroundColor: "#ff0000" })
  })

  // -------------------------------------------------------------------------
  // 10. Checkbox field
  // -------------------------------------------------------------------------
  it("renders a checked checkbox and toggles on click", async () => {
    const changedValues: string[] = []
    render(
      <InlineCellEditor
        field={makeField({ type: "checkbox" as FieldType })}
        value="true"
        onChange={(value) => {
          changedValues.push(value)
        }}
      />,
    )

    // Should render a checkbox in checked state
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeChecked()

    // Clicking should toggle to 'false'
    await userEvent.click(checkbox)
    expect(changedValues).toEqual(["false"])
  })

  // -------------------------------------------------------------------------
  // 11. Formula field read-only
  // -------------------------------------------------------------------------
  it("displays formula value as plain text and does not enter edit mode on click", async () => {
    const onChange = vi.fn()
    render(
      <InlineCellEditor
        field={makeField({ type: "formula" as FieldType })}
        value="42"
        onChange={onChange}
      />,
    )

    // Should display the value
    expect(screen.getByText("42")).toBeInTheDocument()

    // Click should NOT enter edit mode (no input should appear)
    await userEvent.click(screen.getByText("42"))

    // There should be no input element
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument()
  })
})
