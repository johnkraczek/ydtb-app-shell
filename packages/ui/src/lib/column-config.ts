import type { LucideIcon } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

export type ColumnConfig = {
  fieldKey: string
  label: string
  visible: boolean
  position: number
  fieldType: string
  icon?: LucideIcon
  locked?: boolean
  source?: "static" | "contact" | "redemption"
}

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Toggle the visibility of a column identified by `fieldKey`.
 *
 * Columns with `locked: true` cannot be toggled.
 * Returns the original array if the column is locked or not found.
 */
export function toggleColumnVisibility(columns: ColumnConfig[], fieldKey: string): ColumnConfig[] {
  const target = columns.find((c) => c.fieldKey === fieldKey)
  if (!target || target.locked) {
    return columns
  }

  return columns.map((col) => (col.fieldKey === fieldKey ? { ...col, visible: !col.visible } : col))
}

/**
 * Reorder columns by moving from `fromIndex` to `toIndex`.
 *
 * Columns with `locked: true` cannot be moved.
 * All positions are reassigned sequentially after the move.
 */
export function reorderColumns(
  columns: ColumnConfig[],
  fromIndex: number,
  toIndex: number,
): ColumnConfig[] {
  const source = columns[fromIndex]
  if (!source || source.locked) {
    return columns
  }

  const target = columns[toIndex]
  if (target?.locked) {
    return columns
  }

  const result = columns.map((col) => ({ ...col }))
  const [moved] = result.splice(fromIndex, 1)
  if (!moved) return columns
  result.splice(toIndex, 0, moved)

  // Reassign sequential positions
  for (let i = 0; i < result.length; i++) {
    const col = result[i]
    if (col) col.position = i
  }

  return result
}

/**
 * Hide all columns except those with `locked: true`.
 */
export function hideAllColumns(columns: ColumnConfig[]): ColumnConfig[] {
  return columns.map((col) => ({
    ...col,
    visible: col.locked === true,
  }))
}
