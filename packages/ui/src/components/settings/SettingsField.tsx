import * as React from "react"

import { cn } from "../../lib/utils.ts"

interface SettingsFieldProps {
  label: string
  description?: string
  children: React.ReactNode
  className?: string
}

function SettingsField({ label, description, children, className }: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <label className="text-sm font-medium leading-none">{label}</label>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export { SettingsField }
export type { SettingsFieldProps }
