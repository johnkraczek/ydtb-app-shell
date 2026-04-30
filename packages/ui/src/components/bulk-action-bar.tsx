import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.ts"

interface BulkActionBarProps {
  selectedCount: number
  onDeselectAll: () => void
  children: React.ReactNode
}

const bulkActionButtonVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "text-zinc-300 hover:bg-zinc-800 hover:text-white dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-50",
        destructive:
          "text-zinc-300 hover:bg-red-500/20 hover:text-red-400 dark:text-zinc-300 dark:hover:bg-red-500/20 dark:hover:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function BulkActionButton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof bulkActionButtonVariants>) {
  return (
    <button
      type="button"
      className={cn(bulkActionButtonVariants({ variant, className }))}
      {...props}
    />
  )
}

function BulkActionBar({ selectedCount, onDeselectAll, children }: BulkActionBarProps) {
  const [mounted, setMounted] = React.useState(false)
  const visible = selectedCount >= 1

  React.useEffect(() => {
    if (visible) {
      const frame = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(frame)
    } else {
      setMounted(false)
    }
  }, [visible])

  if (!visible) return null

  return createPortal(
    <div
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-50 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{
        transform: mounted ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(16px)",
        opacity: mounted ? 1 : 0,
        transition: "transform 200ms ease-out, opacity 200ms ease-out",
      }}
    >
      {/* Left side: count + deselect */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">{selectedCount} selected</span>
        <button
          type="button"
          onClick={onDeselectAll}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-700"
          aria-label="Deselect all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Separator */}
      <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-600" />

      {/* Right side: action buttons from consumer */}
      <div className="flex items-center gap-1">{children}</div>
    </div>,
    document.body,
  )
}

export { BulkActionBar, BulkActionButton, bulkActionButtonVariants }
export type { BulkActionBarProps }
