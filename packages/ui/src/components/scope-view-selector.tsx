/**
 * ScopeViewSelector — dropdown for switching the current viewing scope at a
 * parent scope.
 *
 * Reads state from `useViewingScope()` (from `@ydtb/tk-scope/client`), writes
 * on selection. Renders Aggregate at top, then descendants sorted
 * alphabetically by label. Returns `null` when the parent scope has no
 * descendants with the current tool installed (`hasDescendants === false`) —
 * leaf scopes don't see the selector.
 *
 * Permission gating (descendants disabled + tooltip) and check-icon feedback
 * arrive in VS-T5. Tests arrive in VS-T6.
 *
 * @example
 * ```tsx
 * import { ScopeViewSelector } from '@ydtb/tk-scope-ui/components/scope-view-selector'
 *
 * function CompanyChrome() {
 *   return (
 *     <div className="flex items-center gap-2">
 *       <Breadcrumbs />
 *       <ScopeViewSelector aggregateLabel="All locations" />
 *     </div>
 *   )
 * }
 * ```
 */

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useViewingScope, type ViewingScope } from "@ydtb/tk-scope/client"

import { cn } from "../lib/utils.ts"
import { Button } from "./button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.tsx"

/**
 * Optional per-descendant permission check. When `false`, that descendant
 * is treated as unavailable in the dropdown (disabled + tooltip, wired in
 * VS-T5). If `undefined` (default), every descendant is selectable.
 */
export type ScopeViewSelectorPermissionCheck = (descendant: {
  scope: string
  scopeId: string
}) => boolean

export interface ScopeViewSelectorProps {
  /** Optional permission check per descendant — see VS-T5 for disabled styling. */
  checkPermission?: ScopeViewSelectorPermissionCheck
  /** Optional className on the root trigger button. */
  className?: string
  /**
   * Label shown on the trigger and the top option when the current viewing
   * scope is aggregate. Defaults to `"Aggregate"`. Consumer chrome often
   * passes something like `"All locations"` for parent-context.
   */
  aggregateLabel?: string
}

/**
 * Whether a given viewing scope value matches the current selection. Used to
 * decide whether to show the Check icon next to an option.
 */
function isSelected(
  current: ViewingScope,
  option: { type: "aggregate" } | { type: "specific"; scopeId: string },
): boolean {
  if (option.type === "aggregate") return current.type === "aggregate"
  return current.type === "specific" && current.scopeId === option.scopeId
}

export function ScopeViewSelector({
  checkPermission,
  className,
  aggregateLabel = "Aggregate",
}: ScopeViewSelectorProps): React.JSX.Element | null {
  const { viewingScope, setViewingScope, hasDescendants, availableDescendants } = useViewingScope()

  const sortedDescendants = React.useMemo(
    () => [...availableDescendants].sort((a, b) => a.label.localeCompare(b.label)),
    [availableDescendants],
  )

  if (!hasDescendants) return null

  const triggerLabel =
    viewingScope.type === "aggregate"
      ? aggregateLabel
      : (sortedDescendants.find((d) => d.scopeId === viewingScope.scopeId)?.label ?? aggregateLabel)

  const aggregateSelected = isSelected(viewingScope, { type: "aggregate" })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          data-slot="scope-view-selector-trigger"
          aria-label="Viewing scope"
        >
          {triggerLabel}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem
          onSelect={() => setViewingScope({ type: "aggregate" })}
          data-slot="scope-view-selector-option"
          data-scope-view="aggregate"
          data-selected={aggregateSelected ? "true" : undefined}
        >
          <CheckIcon
            data-slot="scope-view-selector-check"
            className={cn("size-4", aggregateSelected ? "opacity-100" : "opacity-0")}
            aria-hidden
          />
          {aggregateLabel}
        </DropdownMenuItem>
        {sortedDescendants.map((d) => {
          const allowed = checkPermission
            ? checkPermission({ scope: d.scope, scopeId: d.scopeId })
            : true
          const selected = isSelected(viewingScope, { type: "specific", scopeId: d.scopeId })

          const icon = (
            <CheckIcon
              data-slot="scope-view-selector-check"
              className={cn("size-4", selected ? "opacity-100" : "opacity-0")}
              aria-hidden
            />
          )

          // When disabled, Radix's DropdownMenuItem drops pointer-events, which
          // means hover on the item itself won't trigger a Tooltip. Wrap the
          // label span in the TooltipTrigger so the hover zone is the text
          // (still visible even when the item is disabled), keeping the
          // tooltip reachable.
          if (!allowed) {
            return (
              <DropdownMenuItem
                key={d.scopeId}
                disabled
                data-slot="scope-view-selector-option"
                data-scope-view={d.scopeId}
                data-disabled="true"
              >
                {icon}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="pointer-events-auto">{d.label}</span>
                  </TooltipTrigger>
                  <TooltipContent>No access to {d.label}</TooltipContent>
                </Tooltip>
              </DropdownMenuItem>
            )
          }

          return (
            <DropdownMenuItem
              key={d.scopeId}
              onSelect={() =>
                setViewingScope({ type: "specific", scopeId: d.scopeId, scope: d.scope })
              }
              data-slot="scope-view-selector-option"
              data-scope-view={d.scopeId}
              data-selected={selected ? "true" : undefined}
            >
              {icon}
              {d.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
