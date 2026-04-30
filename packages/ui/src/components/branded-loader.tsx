/**
 * BrandedLoader — full-screen loading skeleton with a pulsing logo.
 *
 * Variants:
 * - "dashboard" (default): header + icon rail + sidebar + content area
 * - "fullscreen": just the centered logo, no chrome
 */

const LogoMark = () => (
  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground animate-pulse">
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  </div>
)

interface BrandedLoaderProps {
  variant?: "dashboard" | "fullscreen"
}

export function BrandedLoader({ variant = "dashboard" }: BrandedLoaderProps) {
  if (variant === "fullscreen") {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <LogoMark />
      </div>
    )
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      {/* Header */}
      <div className="h-14 bg-card shrink-0" />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Icon rail */}
        <div className="hidden lg:block w-[60px] bg-card shrink-0 rounded-xl" />

        {/* Sidebar */}
        <div className="hidden lg:block w-[260px] bg-card shrink-0 rounded-xl" />

        {/* Main content with centered logo */}
        <div className="flex-1 flex items-center justify-center rounded-xl bg-card">
          <LogoMark />
        </div>
      </div>
    </div>
  )
}
