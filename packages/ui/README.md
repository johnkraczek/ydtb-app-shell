# @ydtb/tk-scope-ui

UI component library for tk-scope — shadcn-style primitives (dropdown, popover, data table, etc.) plus toolkit-specific components.

## `<ScopeViewSelector>`

Dropdown for switching the current viewing scope at a parent scope. Reads state from `useViewingScope()` (`@ydtb/tk-scope/client`), writes on selection.

```tsx
import { ScopeViewSelector } from "@ydtb/tk-scope-ui/components/scope-view-selector"

function CompanyHeader() {
  return (
    <div className="flex items-center gap-2">
      <Breadcrumbs />
      <ScopeViewSelector aggregateLabel="All locations" />
    </div>
  )
}
```

Behaviors:

- Returns `null` when the parent scope has no descendants with the current tool installed (`useViewingScope().hasDescendants === false`). Leaf scopes don't see the selector.
- Aggregate option always appears first; descendants below, sorted alphabetically by label.
- Selecting an option calls `setViewingScope` and updates `?view=` via `history.replaceState`.
- Check icon marks the current selection.
- `checkPermission?: (descendant) => boolean` prop disables descendants the user can't access and wraps the label in a tooltip ("No access to {label}").

Must be rendered inside a `<ViewingScopeProvider>` tree — see `@ydtb/tk-scope` README for wiring.
