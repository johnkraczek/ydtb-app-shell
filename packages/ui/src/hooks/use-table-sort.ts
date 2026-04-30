import { useState, useCallback } from "react"

export interface SortConfig {
  field: string
  direction: "asc" | "desc"
}

const MAX_SORTS = 3

export function useTableSort() {
  const [sorts, setSorts] = useState<SortConfig[]>([])

  const toggleSort = useCallback((field: string) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.field === field)

      if (!existing) {
        // OFF → ASC: add to sorts
        const newSorts = [...prev, { field, direction: "asc" as const }]
        if (newSorts.length > MAX_SORTS) {
          newSorts.shift()
        }
        return newSorts
      }

      if (existing.direction === "asc") {
        // ASC → DESC: toggle direction in place
        return prev.map((s) => (s.field === field ? { ...s, direction: "desc" as const } : s))
      }

      // DESC → OFF: remove from sorts
      return prev.filter((s) => s.field !== field)
    })
  }, [])

  const resetSorts = useCallback(() => {
    setSorts([])
  }, [])

  return { sorts, setSorts, toggleSort, resetSorts }
}
