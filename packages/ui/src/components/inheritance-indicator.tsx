/**
 * InheritanceIndicator — describes where a scoped value (credential, setting,
 * etc.) is sourced from at the queried scope: local, inherited from an
 * ancestor, or none. Optionally renders override / revert actions.
 *
 * Built as the first consumer in `@ydtb/tk-scope-ui` per 2026-04-19 audit
 * Finding C2 — CSC is the first consumer; Correlation will import this
 * component when it builds later, so the shape stays value-agnostic (nothing
 * credential-specific).
 *
 * @example
 * ```tsx
 * <InheritanceIndicator
 *   inheritance={{ type: 'inherited', ancestorScope: 'company', ancestorScopeId: 'co-1', ancestorLabel: 'Acme HQ' }}
 *   showAncestor
 *   canOverride
 *   onOverride={() => openDialog()}
 * />
 * ```
 */

import * as React from "react"
import { ArrowUpFromLine, Lock, RotateCcw } from "lucide-react"
import { cn } from "../lib/utils.ts"
import { Button } from "./button.tsx"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Inheritance state for a scoped value. Structurally compatible with the
 * `InheritanceState` defined by tool-integrations; tools are free to import
 * either one — TypeScript structural typing resolves them as the same shape.
 */
export type InheritanceState =
  | { type: "local" }
  | {
      type: "inherited"
      ancestorScope: string
      ancestorScopeId: string
      ancestorLabel: string | null
    }
  | { type: "none" }

export interface InheritanceIndicatorProps {
  inheritance: InheritanceState
  /**
   * When true and the state is `inherited`, show the ancestor's label ("from
   * Acme HQ") instead of the generic "managed upstream". Callers gate this
   * on the viewer's `view-upstream` permission.
   */
  showAncestor?: boolean
  /** Override action — wired to an OAuth/override dialog by the consumer. */
  onOverride?: () => void
  /**
   * Revert action — wired to a "delete this local row and fall back to
   * upstream" flow by the consumer. Only meaningful for local rows that
   * shadow an inherited one.
   */
  onRevert?: () => void
  canOverride?: boolean
  canRevert?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InheritanceIndicator({
  inheritance,
  showAncestor = false,
  onOverride,
  onRevert,
  canOverride = false,
  canRevert = false,
  className,
}: InheritanceIndicatorProps): React.JSX.Element | null {
  if (inheritance.type === "none") return null

  const isLocal = inheritance.type === "local"
  const label = isLocal
    ? "Local to this scope"
    : showAncestor && inheritance.ancestorLabel
      ? `Inherited from ${inheritance.ancestorLabel}`
      : "Managed upstream"

  return (
    <div
      className={cn("inline-flex items-center gap-2 text-xs text-muted-foreground", className)}
      data-inheritance={inheritance.type}
    >
      <span className="inline-flex items-center gap-1">
        {isLocal ? (
          <ArrowUpFromLine className="size-3" aria-hidden />
        ) : (
          <Lock className="size-3" aria-hidden />
        )}
        <span>{label}</span>
      </span>

      {!isLocal && onOverride && canOverride ? (
        <Button type="button" size="sm" variant="outline" onClick={onOverride}>
          Override for this scope
        </Button>
      ) : null}

      {isLocal && onRevert && canRevert ? (
        <Button type="button" size="sm" variant="ghost" onClick={onRevert}>
          <RotateCcw className="size-3" aria-hidden />
          Revert to upstream
        </Button>
      ) : null}
    </div>
  )
}
