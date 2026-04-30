/**
 * ShareWithDescendantsToggle — two stacked switches for the CSC "share a
 * parent-scope credential with descendants" flow.
 *
 * Top toggle ("Share with descendant scopes") maps to `shared`; renders alone
 * at parent scopes when off. When on, a second toggle ("Use as default for
 * descendants") appears and maps to `defaultForDescendants`.
 *
 * Returns `null` when `scopeHasDescendants` is false so leaf scopes never see
 * the UI.
 *
 * Built here (not inside the integrations tool) per 2026-04-19 third-pass
 * audit M2 — CSC is the first consumer, but the toggle's semantics apply to
 * any sharable resource. A future credentials-vault UI (or other sharable
 * platform primitives) will reuse this component unchanged.
 */

import * as React from "react"
import { cn } from "../lib/utils.ts"
import { Label } from "./label.tsx"
import { Switch } from "./switch.tsx"

export interface ShareWithDescendantsToggleProps {
  /** Maps to the row's `shared` column. */
  value: boolean
  onChange: (next: boolean) => void
  /** Controls visibility — the toggle only makes sense when descendants exist. */
  scopeHasDescendants: boolean
  disabled?: boolean

  /** Maps to the row's `defaultForDescendants` column; required when `value` is true. */
  defaultValue?: boolean
  onDefaultChange?: (next: boolean) => void

  className?: string
}

export function ShareWithDescendantsToggle({
  value,
  onChange,
  scopeHasDescendants,
  disabled = false,
  defaultValue = false,
  onDefaultChange,
  className,
}: ShareWithDescendantsToggleProps): React.JSX.Element | null {
  const defaultId = React.useId()
  const shareId = React.useId()

  if (!scopeHasDescendants) return null

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label htmlFor={shareId} className="font-medium">
            Share with descendant scopes
          </Label>
          <p className="text-xs text-muted-foreground">
            Descendant scopes can use this connection without connecting their own.
          </p>
        </div>
        <Switch id={shareId} checked={value} onCheckedChange={onChange} disabled={disabled} />
      </div>

      {value ? (
        <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
          <div>
            <Label htmlFor={defaultId} className="font-medium">
              Use as default for descendants
            </Label>
            <p className="text-xs text-muted-foreground">
              Descendants fall back to this connection unless they override it locally.
            </p>
          </div>
          <Switch
            id={defaultId}
            checked={defaultValue}
            onCheckedChange={onDefaultChange}
            disabled={disabled || !onDefaultChange}
          />
        </div>
      ) : null}
    </div>
  )
}
