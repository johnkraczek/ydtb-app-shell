import * as React from "react"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Checkbox } from "../checkbox.tsx"
import { Skeleton } from "../skeleton.tsx"
import { cn } from "../../lib/utils.ts"

// ── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string
  header: React.ReactNode
  render: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface SortConfig {
  field: string
  direction: "asc" | "desc"
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  getRowId: (row: T) => string
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  onRowClick?: (row: T) => void
  onSortChange?: (sorts: SortConfig[]) => void
  sorts?: SortConfig[]
  isLoading?: boolean
  emptyState?: React.ReactNode
  noResultsState?: React.ReactNode
  tfoot?: React.ReactNode
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  className?: string
}

// ── Component ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  getRowId,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onSortChange,
  sorts = [],
  isLoading = false,
  emptyState,
  noResultsState,
  tfoot,
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  className,
}: DataTableProps<T>) {
  const showSelection = selectedIds !== undefined && onSelectionChange !== undefined
  const showPagination = total !== undefined

  // ── Selection helpers ────────────────────────────────────────────────────

  const allSelected =
    showSelection && data.length > 0 && data.every((row) => selectedIds!.has(getRowId(row)))

  const someSelected =
    showSelection &&
    data.length > 0 &&
    data.some((row) => selectedIds!.has(getRowId(row))) &&
    !allSelected

  function handleSelectAll() {
    if (!onSelectionChange) return
    if (allSelected) {
      onSelectionChange(new Set<string>())
    } else {
      onSelectionChange(new Set(data.map(getRowId)))
    }
  }

  function handleToggleRow(row: T) {
    if (!onSelectionChange || !selectedIds) return
    const id = getRowId(row)
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectionChange(next)
  }

  // ── Sort helpers ─────────────────────────────────────────────────────────

  const MAX_SORTS = 3

  function getSortForField(field: string): SortConfig | undefined {
    return sorts.find((s) => s.field === field)
  }

  function getSortIndex(field: string): number {
    return sorts.findIndex((s) => s.field === field)
  }

  function handleSortClick(column: ColumnDef<T>) {
    if (!column.sortable || !onSortChange) return

    const existing = getSortForField(column.key)

    if (!existing) {
      // OFF → ASC: add to sorts
      const newSorts = [...sorts, { field: column.key, direction: "asc" as const }]
      // If we exceed max sorts, drop the oldest
      if (newSorts.length > MAX_SORTS) {
        newSorts.shift()
      }
      onSortChange(newSorts)
    } else if (existing.direction === "asc") {
      // ASC → DESC: toggle direction in place
      onSortChange(
        sorts.map((s) => (s.field === column.key ? { ...s, direction: "desc" as const } : s)),
      )
    } else {
      // DESC → OFF: remove from sorts
      onSortChange(sorts.filter((s) => s.field !== column.key))
    }
  }

  // ── Pagination helpers ───────────────────────────────────────────────────

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total ?? 0)
  const hasPrev = page > 1
  const hasNext = total !== undefined && page * pageSize < total

  // ── Empty / No-results state ─────────────────────────────────────────────

  if (!isLoading && data.length === 0) {
    if (emptyState) return <>{emptyState}</>
    if (noResultsState) return <>{noResultsState}</>
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col",
        className,
      )}
    >
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[600px]" role="table">
          <thead>
            <tr className="border-b border-border">
              {showSelection && (
                <th className="w-10 pl-4 pr-0 py-3 text-left" role="columnheader">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, colIdx) => (
                <th
                  key={col.key}
                  role="columnheader"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                    showSelection && colIdx === 0 && "pl-2",
                    col.sortable && "cursor-pointer select-none",
                    col.className,
                  )}
                  onClick={() => handleSortClick(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (() => {
                        const sort = getSortForField(col.key)
                        const sortIdx = getSortIndex(col.key)
                        return sort ? (
                          <>
                            <span
                              className="flex items-center text-foreground"
                              aria-label={`Sort ${sort.direction === "asc" ? "ascending" : "descending"}`}
                            >
                              {sort.direction === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                              )}
                            </span>
                            {sorts.length >= 2 && (
                              <span className="inline-flex items-center justify-center h-4 min-w-4 px-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                                {sortIdx + 1}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="flex items-center text-muted-foreground/30">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        )
                      })()}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {showSelection && (
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row) => {
                  const rowId = getRowId(row)
                  return (
                    <tr
                      key={rowId}
                      tabIndex={0}
                      role="row"
                      className={cn(
                        "hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={(e) => {
                        const target = e.target as HTMLElement
                        if (
                          target.closest(
                            'button, a, [role="menuitem"], [data-radix-collection-item]',
                          )
                        )
                          return
                        onRowClick?.(row)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          onRowClick?.(row)
                        } else if (e.key === " ") {
                          e.preventDefault()
                          if (showSelection) {
                            handleToggleRow(row)
                          }
                        }
                      }}
                    >
                      {showSelection && (
                        <td className="w-10 pl-4 pr-0 py-3">
                          <Checkbox
                            checked={selectedIds!.has(rowId)}
                            onCheckedChange={() => handleToggleRow(row)}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3 text-sm",
                            showSelection && colIdx === 0 && "pl-2",
                            col.className,
                          )}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
          </tbody>
          {tfoot}
        </table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {`Showing ${startItem}\u2013${endItem} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="button"
              aria-label="Previous page"
              disabled={!hasPrev}
              className={cn(
                "px-3 py-1 text-sm rounded-md border border-border",
                !hasPrev && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => hasPrev && onPageChange?.(page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              role="button"
              aria-label="Next page"
              disabled={!hasNext}
              className={cn(
                "px-3 py-1 text-sm rounded-md border border-border",
                !hasNext && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => hasNext && onPageChange?.(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
