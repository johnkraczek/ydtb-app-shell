import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronsLeft, ChevronsRight, X } from "lucide-react"

interface TabbedPanelTab {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

interface TabbedPanelProps {
  open: boolean
  onClose: () => void
  tabs: TabbedPanelTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  width?: string | number
  backdrop?: boolean
  inline?: boolean
  fullscreen?: boolean
  collapsible?: boolean
  className?: string
  style?: React.CSSProperties
}

function TabbedPanel({
  open,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  header,
  footer,
  children,
  width = "420px",
  backdrop = true,
  inline = false,
  fullscreen = false,
  collapsible = false,
  className,
  style,
}: TabbedPanelProps) {
  const hasTabs = tabs.length > 0
  const [railCollapsed, setRailCollapsed] = React.useState(collapsible)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const panelId = React.useId().replace(/:/g, "")

  // Store the trigger element when the panel opens, restore focus on close
  React.useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null
    } else if (triggerRef.current) {
      // Return focus to the element that triggered the panel
      const el = triggerRef.current
      triggerRef.current = null
      // Use requestAnimationFrame to ensure DOM is updated before focusing
      requestAnimationFrame(() => {
        if (el && typeof el.focus === "function") {
          el.focus()
        }
      })
    }
  }, [open])

  React.useEffect(() => {
    if (inline) return
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, inline])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const resolvedWidth = typeof width === "number" ? `${width}px` : width

  const panelStyle = {
    width: resolvedWidth,
    backgroundColor: "var(--color-card, #ffffff)",
    color: "var(--color-card-foreground, #09090b)",
    borderColor: "var(--color-border, #e4e4e7)",
    ...style,
  }

  const panelContent = (
    <>
      {/* Tab bar - only rendered when tabs are provided */}
      {hasTabs && (
        <div
          className="flex flex-col py-3 gap-1 shrink-0"
          role="tablist"
          aria-orientation="vertical"
          style={{
            width: collapsible && !railCollapsed ? "160px" : "48px",
            borderRight: "1px solid var(--color-border, #e4e4e7)",
            transition: "width 150ms ease",
          }}
        >
          {collapsible && (
            <button
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors mb-1 ${
                railCollapsed ? "self-center" : "ml-1"
              }`}
              style={{ color: "var(--color-muted-foreground, #71717a)" }}
              onClick={() => setRailCollapsed(!railCollapsed)}
              aria-label={railCollapsed ? "Expand tab rail" : "Collapse tab rail"}
            >
              {railCollapsed ? (
                <ChevronsRight className="h-[18px] w-[18px]" />
              ) : (
                <ChevronsLeft className="h-[18px] w-[18px]" />
              )}
            </button>
          )}
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const expanded = collapsible && !railCollapsed
            return (
              <button
                key={tab.id}
                className={`flex items-center rounded-lg transition-colors ${
                  expanded ? "gap-2 px-3 h-9 mx-1 text-sm" : "justify-center w-9 h-9 self-center"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--color-primary, #6366f1)",
                        color: "var(--color-primary-foreground, #ffffff)",
                      }
                    : { color: "var(--color-muted-foreground, #71717a)" }
                }
                onClick={() => onTabChange(tab.id)}
                title={tab.label}
                aria-label={tab.label}
                aria-selected={isActive}
                role="tab"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span className="truncate">{tab.label}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {header}
        <div className="flex-1 overflow-y-auto" role="tabpanel">
          {children}
        </div>
        {footer}
      </div>
    </>
  )

  // Inline mode: part of layout on desktop, overlay on mobile
  if (inline) {
    return (
      <>
        {/* Mobile-only backdrop */}
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />

        {/* Desktop: inline card | Mobile: fixed overlay */}
        <div
          className={`shrink-0 m-4 rounded-xl border shadow-2xl flex overflow-hidden max-md:fixed max-md:top-4 max-md:right-4 max-md:bottom-4 max-md:z-50 max-md:m-0${className ? ` ${className}` : ""}`}
          style={panelStyle}
        >
          {panelContent}
        </div>
      </>
    )
  }

  // Fullscreen mode: portal filling viewport with inset gap
  if (fullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-50" data-fullscreen="true">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

        {/* Panel — fills viewport with inset gap */}
        <div
          className={`absolute inset-4 flex rounded-xl border shadow-2xl overflow-hidden${className ? ` ${className}` : ""}`}
          style={{
            ...panelStyle,
            width: undefined,
          }}
        >
          {/* Fullscreen close button — vertically centered with header row (p-4 + input height) */}
          <button
            className="absolute top-[18px] right-4 z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-muted, #f4f4f5)",
              color: "var(--color-muted-foreground, #71717a)",
            }}
            onClick={onClose}
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
          {panelContent}
        </div>
      </div>,
      document.body,
    )
  }

  // Overlay mode (default): portal with fixed positioning
  // On mobile (< sm), expand to full-screen sheet
  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] max-sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Scoped responsive width: full-screen on mobile, fixed width on sm+ */}
      <style>{`@media(min-width:640px){[data-panel-id="${panelId}"]{width:${resolvedWidth}}}`}</style>

      {/* Panel — full-screen on mobile, positioned drawer on sm+ */}
      <div
        data-panel-id={panelId}
        className={`absolute inset-0 sm:inset-auto sm:top-4 sm:right-4 sm:bottom-4 flex sm:rounded-xl border shadow-2xl overflow-hidden${className ? ` ${className}` : ""}`}
        style={{
          ...panelStyle,
          width: undefined,
        }}
      >
        {/* Mobile close button */}
        <button
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors sm:hidden"
          style={{
            backgroundColor: "var(--color-muted, #f4f4f5)",
            color: "var(--color-muted-foreground, #71717a)",
          }}
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
        {panelContent}
      </div>
    </div>,
    document.body,
  )
}

export { TabbedPanel }
export type { TabbedPanelProps, TabbedPanelTab }
