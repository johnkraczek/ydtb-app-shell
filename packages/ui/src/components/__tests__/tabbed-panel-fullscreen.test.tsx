import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TabbedPanel } from "../tabbed-panel"
import type { TabbedPanelTab } from "../tabbed-panel"

// --- Mock icon component ---

const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className} />
)

// --- Helpers ---

const defaultTabs: TabbedPanelTab[] = [
  { id: "tab-1", icon: MockIcon, label: "Tab One" },
  { id: "tab-2", icon: MockIcon, label: "Tab Two" },
]

function renderFullscreenPanel(overrides: Record<string, unknown> = {}) {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    tabs: defaultTabs,
    activeTab: "tab-1",
    onTabChange: vi.fn(),
    children: <div data-testid="panel-content">Panel Content</div>,
    fullscreen: true,
  }

  const merged = { ...defaultProps, ...overrides }

  // Cast to any because fullscreen prop does not exist on TabbedPanelProps yet
  return render(<TabbedPanel {...(merged as any)} />)
}

// --- Tests ---

describe("TabbedPanel fullscreen mode", () => {
  it("renders as portal to document.body when fullscreen={true}", () => {
    renderFullscreenPanel()

    const content = screen.getByTestId("panel-content")
    expect(content).toBeInTheDocument()
    expect(document.body.contains(content)).toBe(true)

    // Fullscreen panel must have a data attribute distinguishing it from overlay mode
    const fullscreenRoot = document.querySelector('[data-fullscreen="true"]')
    expect(fullscreenRoot).not.toBeNull()
  })

  it("nearly fills viewport with inset gap on all sides", () => {
    renderFullscreenPanel()

    // Fullscreen mode should use inset-4 on the panel element itself (all four sides),
    // NOT the overlay pattern which uses sm:top-4 sm:right-4 sm:bottom-4 (no left, fixed width).
    const content = screen.getByTestId("panel-content")

    // Find the panel container — in fullscreen it should have inset-4 applied
    // unconditionally (not behind sm: breakpoint prefix)
    const panel = content.closest('[class*="inset-4"]')
    expect(panel).not.toBeNull()

    // The panel must NOT have a fixed width — fullscreen fills the viewport
    const panelEl = panel as HTMLElement
    expect(panelEl.className).not.toMatch(/sm:inset-auto/)
    expect(panelEl.style.width).toBeFalsy()
  })

  it("has dark backdrop that covers full viewport", () => {
    renderFullscreenPanel()

    // Fullscreen backdrop must be visible at all screen sizes (no max-sm:hidden)
    const backdrop = document.querySelector(".bg-black\\/40")
    expect(backdrop).not.toBeNull()

    const backdropEl = backdrop as HTMLElement
    // Fullscreen backdrop must NOT be hidden on small screens
    expect(backdropEl.className).not.toMatch(/max-sm:hidden/)
    // Must cover full viewport
    expect(backdropEl.className).toContain("inset-0")
  })

  it("ESC closes the fullscreen panel", () => {
    const closeEvents: string[] = []
    renderFullscreenPanel({
      onClose: () => {
        closeEvents.push("closed")
      },
    })

    fireEvent.keyDown(window, { key: "Escape" })

    expect(closeEvents).toEqual(["closed"])
  })

  it("tabs, header, and footer render correctly in fullscreen mode", () => {
    renderFullscreenPanel({
      header: <div data-testid="panel-header">Header Content</div>,
      footer: <div data-testid="panel-footer">Footer Content</div>,
      tabs: defaultTabs,
      activeTab: "tab-1",
    })

    // Tab buttons should be visible
    expect(screen.getByRole("tab", { name: "Tab One" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tab Two" })).toBeInTheDocument()

    // Header and footer slots should render
    expect(screen.getByTestId("panel-header")).toBeInTheDocument()
    expect(screen.getByTestId("panel-footer")).toBeInTheDocument()

    // Main content should render
    expect(screen.getByTestId("panel-content")).toBeInTheDocument()

    // All of these must be inside a fullscreen-marked container
    const fullscreenRoot = document.querySelector('[data-fullscreen="true"]')
    expect(fullscreenRoot).not.toBeNull()
    expect(fullscreenRoot!.contains(screen.getByTestId("panel-content"))).toBe(true)
  })
})
