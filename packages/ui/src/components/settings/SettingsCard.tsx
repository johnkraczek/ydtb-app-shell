import * as React from "react"

import { cn } from "../../lib/utils.ts"

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

function SettingsCard({ title, description, children, action, className }: SettingsCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

export { SettingsCard }
export type { SettingsCardProps }
