/**
 * Tests for <ScopeViewSelector> — renders against a live ViewingScopeProvider
 * (not a mocked hook) so the integration from VS-01 through VS-02 is exercised
 * end-to-end.
 *
 * Covers acceptance criteria from VS-T4, VS-T5, VS-T6:
 * - null-return when !hasDescendants
 * - base render: Aggregate on top, descendants below
 * - alphabetical sort of descendants
 * - click Aggregate / descendant writes correct state
 * - checkPermission: disabled item + tooltip
 * - Aggregate always enabled
 * - Check icon visible on the currently-selected option
 * - keyboard smoke: trigger opens with Enter
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { ViewingScopeProvider, type ViewingScopeProviderProps } from "@ydtb/tk-scope/client"
import { ScopeViewSelector } from "../scope-view-selector.tsx"

const DESCENDANTS: ViewingScopeProviderProps["availableDescendants"] = [
  { scope: "location", scopeId: "loc_c", label: "Charlotte" },
  { scope: "location", scopeId: "loc_a", label: "Aspen" },
  { scope: "location", scopeId: "loc_b", label: "Boulder" },
]

function renderWithProvider(ui: ReactNode, overrides?: Partial<ViewingScopeProviderProps>) {
  return render(
    <ViewingScopeProvider
      parentScope="company"
      parentScopeId="co_123"
      availableDescendants={DESCENDANTS}
      {...overrides}
    >
      {ui}
    </ViewingScopeProvider>,
  )
}

function setUrl(url: string): void {
  window.history.replaceState(null, "", url)
}

beforeEach(() => setUrl("/correlation"))

describe("ScopeViewSelector — render branching", () => {
  it("returns null when !hasDescendants (empty availableDescendants)", () => {
    const { container } = renderWithProvider(<ScopeViewSelector />, {
      availableDescendants: [],
    })
    expect(container.firstChild).toBeNull()
  })

  it("renders the trigger when hasDescendants is true", () => {
    renderWithProvider(<ScopeViewSelector />)
    const trigger = screen.getByRole("button", { name: /viewing scope/i })
    expect(trigger).toBeInTheDocument()
  })
})

describe("ScopeViewSelector — options + sort order", () => {
  it("shows Aggregate first and descendants below, sorted alphabetically by label", async () => {
    const user = userEvent.setup()
    renderWithProvider(<ScopeViewSelector />)
    await user.click(screen.getByRole("button", { name: /viewing scope/i }))

    const options = await screen.findAllByRole("menuitem")
    const labels = options.map((el) => el.textContent?.trim())
    expect(labels).toEqual(["Aggregate", "Aspen", "Boulder", "Charlotte"])
  })

  it("respects a custom aggregateLabel prop", async () => {
    const user = userEvent.setup()
    renderWithProvider(<ScopeViewSelector aggregateLabel="All locations" />)

    const trigger = screen.getByRole("button", { name: /viewing scope/i })
    expect(trigger).toHaveTextContent("All locations")

    await user.click(trigger)
    expect(await screen.findByRole("menuitem", { name: /all locations/i })).toBeInTheDocument()
  })
})

describe("ScopeViewSelector — selection writes state and URL", () => {
  it("clicking Aggregate writes aggregate state (stays on aggregate when already aggregate)", async () => {
    const user = userEvent.setup()
    setUrl("/correlation?view=loc_a")
    renderWithProvider(<ScopeViewSelector />)

    await user.click(screen.getByRole("button", { name: /viewing scope/i }))
    await user.click(await screen.findByRole("menuitem", { name: /aggregate/i }))

    expect(new URL(window.location.href).searchParams.get("view")).toBeNull()
  })

  it("clicking a descendant writes specific state with the right scopeId", async () => {
    const user = userEvent.setup()
    renderWithProvider(<ScopeViewSelector />)

    await user.click(screen.getByRole("button", { name: /viewing scope/i }))
    await user.click(await screen.findByRole("menuitem", { name: /boulder/i }))

    expect(new URL(window.location.href).searchParams.get("view")).toBe("loc_b")
  })
})

describe("ScopeViewSelector — check icon on current selection", () => {
  it("shows Check icon opacity-100 on the currently-selected option and opacity-0 on others", async () => {
    const user = userEvent.setup()
    setUrl("/correlation?view=loc_a")
    renderWithProvider(<ScopeViewSelector />)

    await user.click(screen.getByRole("button", { name: /viewing scope/i }))
    const options = await screen.findAllByRole("menuitem")

    for (const option of options) {
      const check = option.querySelector('[data-slot="scope-view-selector-check"]')
      expect(check).not.toBeNull()
      if (option.textContent?.includes("Aspen")) {
        expect(check).toHaveClass("opacity-100")
      } else {
        expect(check).toHaveClass("opacity-0")
      }
    }
  })
})

describe("ScopeViewSelector — permission gating", () => {
  it("disables descendants that fail checkPermission", async () => {
    const user = userEvent.setup()
    const checkPermission = vi.fn(({ scopeId }) => scopeId !== "loc_b")
    renderWithProvider(<ScopeViewSelector checkPermission={checkPermission} />)

    await user.click(screen.getByRole("button", { name: /viewing scope/i }))
    const boulder = (await screen.findAllByRole("menuitem")).find((el) =>
      el.textContent?.includes("Boulder"),
    )
    expect(boulder).toBeDefined()
    expect(boulder).toHaveAttribute("data-disabled")
  })

  it("keeps Aggregate enabled even if checkPermission would have denied the parent scope", async () => {
    const user = userEvent.setup()
    const checkPermission = vi.fn(() => false) // deny everything
    renderWithProvider(<ScopeViewSelector checkPermission={checkPermission} />)

    await user.click(screen.getByRole("button", { name: /viewing scope/i }))
    const aggregate = await screen.findByRole("menuitem", { name: /aggregate/i })
    expect(aggregate).not.toHaveAttribute("data-disabled")
  })

  it("does NOT call checkPermission for Aggregate (it is parent scope, not a descendant)", async () => {
    const user = userEvent.setup()
    const checkPermission = vi.fn<(arg: { scopeId: string }) => boolean>(() => true)
    renderWithProvider(<ScopeViewSelector checkPermission={checkPermission} />)
    await user.click(screen.getByRole("button", { name: /viewing scope/i }))

    const calledScopeIds = checkPermission.mock.calls.map(([arg]) => arg.scopeId)
    expect(calledScopeIds).not.toContain("aggregate")
    expect(calledScopeIds.sort()).toEqual(["loc_a", "loc_b", "loc_c"])
  })
})

describe("ScopeViewSelector — keyboard smoke", () => {
  it("Enter on trigger opens the menu", async () => {
    renderWithProvider(<ScopeViewSelector />)
    const trigger = screen.getByRole("button", { name: /viewing scope/i })
    trigger.focus()
    expect(trigger).toHaveFocus()

    await act(async () => {
      fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" })
    })

    // Menu should render at least one menuitem
    const items = await screen.findAllByRole("menuitem")
    expect(items.length).toBeGreaterThan(0)
  })
})
