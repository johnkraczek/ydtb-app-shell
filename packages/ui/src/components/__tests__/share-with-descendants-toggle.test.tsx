import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ShareWithDescendantsToggle } from "../share-with-descendants-toggle.tsx"

describe("<ShareWithDescendantsToggle>", () => {
  it("renders nothing when scopeHasDescendants is false", () => {
    const { container } = render(
      <ShareWithDescendantsToggle value={false} onChange={() => {}} scopeHasDescendants={false} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders the share toggle when scopeHasDescendants is true", () => {
    render(<ShareWithDescendantsToggle value={false} onChange={() => {}} scopeHasDescendants />)
    expect(screen.getByLabelText("Share with descendant scopes")).toBeInTheDocument()
    expect(screen.queryByLabelText("Use as default for descendants")).not.toBeInTheDocument()
  })

  it("shows the default toggle only when value is true", () => {
    render(
      <ShareWithDescendantsToggle
        value={true}
        onChange={() => {}}
        scopeHasDescendants
        defaultValue={false}
        onDefaultChange={() => {}}
      />,
    )
    expect(screen.getByLabelText("Use as default for descendants")).toBeInTheDocument()
  })

  it("fires onChange when the share toggle is clicked", () => {
    const changeValues: boolean[] = []
    render(
      <ShareWithDescendantsToggle
        value={false}
        onChange={(value) => {
          changeValues.push(value)
        }}
        scopeHasDescendants
      />,
    )
    fireEvent.click(screen.getByLabelText("Share with descendant scopes"))
    expect(changeValues).toEqual([true])
  })

  it("fires onDefaultChange when the default toggle is clicked", () => {
    const defaultChangeValues: boolean[] = []
    render(
      <ShareWithDescendantsToggle
        value={true}
        onChange={() => {}}
        scopeHasDescendants
        defaultValue={false}
        onDefaultChange={(value) => {
          defaultChangeValues.push(value)
        }}
      />,
    )
    fireEvent.click(screen.getByLabelText("Use as default for descendants"))
    expect(defaultChangeValues).toEqual([true])
  })
})
