import { useTableSearch } from "../use-table-search"
import { useTablePagination } from "../use-table-pagination"
import { useTableSort } from "../use-table-sort"
import { useTableSelection } from "../use-table-selection"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

// ---------------------------------------------------------------------------
// useTableSearch
// ---------------------------------------------------------------------------
describe("useTableSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces the search value by 300ms", () => {
    const { result } = renderHook(() => useTableSearch())

    // Immediately after calling setSearch, the raw search value updates but
    // debouncedSearch should still be the initial empty string.
    act(() => {
      result.current.setSearch("hello")
    })
    expect(result.current.search).toBe("hello")
    expect(result.current.debouncedSearch).toBe("")

    // Advance time by 300ms so the debounce fires.
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.debouncedSearch).toBe("hello")
  })

  it("resets both search and debouncedSearch immediately", () => {
    const { result } = renderHook(() => useTableSearch())

    // Set a search value and let the debounce settle.
    act(() => {
      result.current.setSearch("hello")
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.search).toBe("hello")
    expect(result.current.debouncedSearch).toBe("hello")

    // Reset should clear both values immediately.
    act(() => {
      result.current.resetSearch()
    })
    expect(result.current.search).toBe("")
    expect(result.current.debouncedSearch).toBe("")
  })
})

// ---------------------------------------------------------------------------
// useTablePagination
// ---------------------------------------------------------------------------
describe("useTablePagination", () => {
  it("tracks page and pageSize state", () => {
    const { result } = renderHook(() => useTablePagination())

    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setPageSize(25)
    })
    expect(result.current.pageSize).toBe(25)
  })

  it("resets page to 1 when a filter dependency changes", () => {
    // The hook accepts a list of dependencies that represent active filters.
    // When any dependency changes the page should reset to 1.
    const { result, rerender } = renderHook(
      ({ filterDeps }: { filterDeps: unknown[] }) => useTablePagination({ filterDeps }),
      { initialProps: { filterDeps: ["initial"] } },
    )

    // Move to page 3.
    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)

    // Changing the filter dependency should reset the page.
    rerender({ filterDeps: ["changed"] })
    expect(result.current.page).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// useTableSort
// ---------------------------------------------------------------------------
describe("useTableSort", () => {
  it("toggles sort direction when the same field is toggled twice", () => {
    const { result } = renderHook(() => useTableSort())

    // First toggle: ascending.
    act(() => {
      result.current.toggleSort("name")
    })
    expect(result.current.sorts).toEqual([{ field: "name", direction: "asc" }])

    // Second toggle on the same field: descending.
    act(() => {
      result.current.toggleSort("name")
    })
    expect(result.current.sorts).toEqual([{ field: "name", direction: "desc" }])
  })

  it("adds a new field to sorts (multi-sort) and cycles off→asc→desc→off", () => {
    const { result } = renderHook(() => useTableSort())

    act(() => {
      result.current.toggleSort("name")
    })
    expect(result.current.sorts).toEqual([{ field: "name", direction: "asc" }])

    // Toggling a different field adds it (multi-sort).
    act(() => {
      result.current.toggleSort("email")
    })
    expect(result.current.sorts).toEqual([
      { field: "name", direction: "asc" },
      { field: "email", direction: "asc" },
    ])

    // Toggling email again → desc
    act(() => {
      result.current.toggleSort("email")
    })
    expect(result.current.sorts).toEqual([
      { field: "name", direction: "asc" },
      { field: "email", direction: "desc" },
    ])

    // Toggling email again → removes it
    act(() => {
      result.current.toggleSort("email")
    })
    expect(result.current.sorts).toEqual([{ field: "name", direction: "asc" }])
  })
})

// ---------------------------------------------------------------------------
// useTableSelection
// ---------------------------------------------------------------------------
describe("useTableSelection", () => {
  it("selectAll adds all IDs and deselectAll clears them", () => {
    const { result } = renderHook(() => useTableSelection())

    act(() => {
      result.current.selectAll(["1", "2", "3"])
    })
    expect(result.current.selectedIds.size).toBe(3)
    expect(result.current.selectedIds.has("1")).toBe(true)
    expect(result.current.selectedIds.has("2")).toBe(true)
    expect(result.current.selectedIds.has("3")).toBe(true)

    act(() => {
      result.current.deselectAll()
    })
    expect(result.current.selectedIds.size).toBe(0)
  })

  it("toggle adds and removes individual IDs", () => {
    const { result } = renderHook(() => useTableSelection())

    act(() => {
      result.current.toggle("1")
    })
    act(() => {
      result.current.toggle("2")
    })
    // Toggle '1' again to remove it.
    act(() => {
      result.current.toggle("1")
    })

    expect(result.current.selectedIds.has("2")).toBe(true)
    expect(result.current.selectedIds.has("1")).toBe(false)
    expect(result.current.count).toBe(1)
    expect(result.current.isSelected("1")).toBe(false)
    expect(result.current.isSelected("2")).toBe(true)
  })
})
