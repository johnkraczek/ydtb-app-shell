import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { InheritanceIndicator } from "../inheritance-indicator.tsx"

describe("<InheritanceIndicator>", () => {
  it("renders null for the `none` state", () => {
    const { container } = render(<InheritanceIndicator inheritance={{ type: "none" }} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders the local label for a local value", () => {
    render(<InheritanceIndicator inheritance={{ type: "local" }} />)
    expect(screen.getByText("Local to this scope")).toBeInTheDocument()
  })

  it('renders "Managed upstream" when showAncestor is false', () => {
    render(
      <InheritanceIndicator
        inheritance={{
          type: "inherited",
          ancestorScope: "company",
          ancestorScopeId: "co-1",
          ancestorLabel: "Acme HQ",
        }}
      />,
    )
    expect(screen.getByText("Managed upstream")).toBeInTheDocument()
  })

  it('renders "Inherited from {Name}" when showAncestor + label present', () => {
    render(
      <InheritanceIndicator
        inheritance={{
          type: "inherited",
          ancestorScope: "company",
          ancestorScopeId: "co-1",
          ancestorLabel: "Acme HQ",
        }}
        showAncestor
      />,
    )
    expect(screen.getByText("Inherited from Acme HQ")).toBeInTheDocument()
  })

  it('falls back to "Managed upstream" when showAncestor but label is null', () => {
    render(
      <InheritanceIndicator
        inheritance={{
          type: "inherited",
          ancestorScope: "company",
          ancestorScopeId: "co-1",
          ancestorLabel: null,
        }}
        showAncestor
      />,
    )
    expect(screen.getByText("Managed upstream")).toBeInTheDocument()
  })

  it("shows the Override button only when canOverride + onOverride supplied on inherited state", () => {
    const overrideClicks: string[] = []
    render(
      <InheritanceIndicator
        inheritance={{
          type: "inherited",
          ancestorScope: "company",
          ancestorScopeId: "co-1",
          ancestorLabel: "Acme HQ",
        }}
        showAncestor
        canOverride
        onOverride={() => {
          overrideClicks.push("override")
        }}
      />,
    )
    const button = screen.getByRole("button", { name: /Override for this scope/i })
    fireEvent.click(button)
    expect(overrideClicks).toEqual(["override"])
  })

  it("hides the Override button when canOverride is false", () => {
    render(
      <InheritanceIndicator
        inheritance={{
          type: "inherited",
          ancestorScope: "company",
          ancestorScopeId: "co-1",
          ancestorLabel: "Acme HQ",
        }}
        showAncestor
        onOverride={() => {}}
      />,
    )
    expect(screen.queryByRole("button", { name: /Override/i })).not.toBeInTheDocument()
  })

  it("shows the Revert button only on local state with canRevert + onRevert", () => {
    const revertClicks: string[] = []
    render(
      <InheritanceIndicator
        inheritance={{ type: "local" }}
        canRevert
        onRevert={() => {
          revertClicks.push("revert")
        }}
      />,
    )
    const button = screen.getByRole("button", { name: /Revert to upstream/i })
    fireEvent.click(button)
    expect(revertClicks).toEqual(["revert"])
  })

  it("does not show Revert on inherited state", () => {
    render(
      <InheritanceIndicator
        inheritance={{
          type: "inherited",
          ancestorScope: "company",
          ancestorScopeId: "co-1",
          ancestorLabel: "Acme HQ",
        }}
        canRevert
        onRevert={() => {}}
      />,
    )
    expect(screen.queryByRole("button", { name: /Revert/i })).not.toBeInTheDocument()
  })
})
