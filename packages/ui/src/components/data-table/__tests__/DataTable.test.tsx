import { describe, it, expect } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataTable } from "../DataTable"
import type { ColumnDef } from "../DataTable"

// ── Test data types ─────────────────────────────────────────────────────────

interface TestRow {
  id: string
  name: string
  email: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeColumns(): ColumnDef<TestRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      render: (row) => row.name,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email,
    },
    {
      key: "id",
      header: "ID",
      render: (row) => row.id,
    },
  ]
}

function makeSortableColumns(): ColumnDef<TestRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      render: (row) => row.name,
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email,
    },
  ]
}

const testRows: TestRow[] = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
]

const getRowId = (row: TestRow) => row.id

// ── Tests ───────────────────────────────────────────────────────────────────

describe("DataTable", () => {
  // ── 1. Renders columns ──────────────────────────────────────────────────

  it("renders header labels and row cells from column definitions", () => {
    render(<DataTable<TestRow> data={testRows} columns={makeColumns()} getRowId={getRowId} />)

    // 3 header cells with correct labels
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByText("ID")).toBeInTheDocument()

    // 2 body rows with cell content from render functions
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("alice@example.com")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("bob@example.com")).toBeInTheDocument()

    // Verify row count: each row should be a <tr> inside <tbody>
    const tbody = screen.getByRole("table").querySelector("tbody")
    expect(tbody).not.toBeNull()
    const rows = within(tbody!).getAllByRole("row")
    expect(rows).toHaveLength(2)

    // Verify header cell count
    const thead = screen.getByRole("table").querySelector("thead")
    expect(thead).not.toBeNull()
    const headerCells = within(thead!).getAllByRole("columnheader")
    expect(headerCells).toHaveLength(3)
  })

  // ── 2. Empty state ──────────────────────────────────────────────────────

  it("shows emptyState when data is empty and not loading", () => {
    render(
      <DataTable<TestRow>
        data={[]}
        columns={makeColumns()}
        getRowId={getRowId}
        isLoading={false}
        emptyState={<div data-testid="empty">No data</div>}
      />,
    )

    expect(screen.getByTestId("empty")).toBeInTheDocument()
    expect(screen.getByText("No data")).toBeInTheDocument()

    // No table body rows should be rendered
    const table = screen.queryByRole("table")
    if (table) {
      const tbody = table.querySelector("tbody")
      if (tbody) {
        const rows = within(tbody).queryAllByRole("row")
        expect(rows).toHaveLength(0)
      }
    }
  })

  // ── 3. No results state ─────────────────────────────────────────────────

  it("shows noResultsState when data is empty after a search/filter", () => {
    render(
      <DataTable<TestRow>
        data={[]}
        columns={makeColumns()}
        getRowId={getRowId}
        noResultsState={<div data-testid="no-results">No results</div>}
      />,
    )

    expect(screen.getByTestId("no-results")).toBeInTheDocument()
    expect(screen.getByText("No results")).toBeInTheDocument()
  })

  // ── 4. Loading state ────────────────────────────────────────────────────

  it("shows skeleton rows when isLoading is true", () => {
    render(
      <DataTable<TestRow> data={[]} columns={makeColumns()} getRowId={getRowId} isLoading={true} />,
    )

    // When loading, real data rows should NOT be rendered
    expect(screen.queryByText("Alice")).not.toBeInTheDocument()
    expect(screen.queryByText("Bob")).not.toBeInTheDocument()

    // Skeleton elements should be present (implementation will use Skeleton component)
    // We look for elements with animate-pulse or skeleton role/class
    const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  // ── 5. Row click ────────────────────────────────────────────────────────

  it("calls onRowClick with row data when a row is clicked", async () => {
    const user = userEvent.setup()
    const clickedRows: TestRow[] = []

    render(
      <DataTable<TestRow>
        data={[{ id: "1", name: "Alice", email: "a@b.com" }]}
        columns={makeColumns()}
        getRowId={getRowId}
        onRowClick={(row) => {
          clickedRows.push(row)
        }}
      />,
    )

    // Click the row containing Alice
    const tbody = screen.getByRole("table").querySelector("tbody")
    expect(tbody).not.toBeNull()
    const row = within(tbody!).getAllByRole("row")[0]
    await user.click(row)

    expect(clickedRows).toEqual([
      {
        id: "1",
        name: "Alice",
        email: "a@b.com",
      },
    ])
  })

  // ── 6. Header checkbox selects all ──────────────────────────────────────

  it("calls onSelectionChange with all IDs when header checkbox clicked", async () => {
    const user = userEvent.setup()
    const selectionChanges: Array<Set<string>> = []

    render(
      <DataTable<TestRow>
        data={[
          { id: "1", name: "Alice", email: "a@b.com" },
          { id: "2", name: "Bob", email: "b@b.com" },
        ]}
        columns={makeColumns()}
        getRowId={getRowId}
        selectedIds={new Set<string>()}
        onSelectionChange={(ids) => {
          selectionChanges.push(new Set(ids))
        }}
      />,
    )

    // Find the header checkbox (should be in <thead>)
    const thead = screen.getByRole("table").querySelector("thead")
    expect(thead).not.toBeNull()
    const headerCheckbox = within(thead!).getByRole("checkbox")
    await user.click(headerCheckbox)

    expect(selectionChanges).toEqual([new Set(["1", "2"])])
  })

  // ── 7. Row checkbox toggles ─────────────────────────────────────────────

  it("calls onSelectionChange with toggled ID when row checkbox clicked", async () => {
    const user = userEvent.setup()
    const selectionChanges: Array<Set<string>> = []

    render(
      <DataTable<TestRow>
        data={[{ id: "1", name: "Alice", email: "a@b.com" }]}
        columns={makeColumns()}
        getRowId={getRowId}
        selectedIds={new Set<string>()}
        onSelectionChange={(ids) => {
          selectionChanges.push(new Set(ids))
        }}
      />,
    )

    // Find the row checkbox (should be in <tbody>)
    const tbody = screen.getByRole("table").querySelector("tbody")
    expect(tbody).not.toBeNull()
    const rowCheckbox = within(tbody!).getByRole("checkbox")
    await user.click(rowCheckbox)

    expect(selectionChanges).toEqual([new Set(["1"])])
  })

  // ── 8. Sort toggle ──────────────────────────────────────────────────────

  it("calls onSortChange with sort config when sortable header clicked", async () => {
    const user = userEvent.setup()
    const sortChanges: Array<Array<{ field: string; direction: string }>> = []

    render(
      <DataTable<TestRow>
        data={testRows}
        columns={makeSortableColumns()}
        getRowId={getRowId}
        onSortChange={(sorts) => {
          sortChanges.push(sorts.map((sort) => ({ ...sort })))
        }}
      />,
    )

    // Click the "Name" header (which is sortable)
    const nameHeader = screen.getByText("Name")
    await user.click(nameHeader)

    expect(sortChanges).toEqual([[{ field: "name", direction: "asc" }]])
  })

  // ── 9. Sort direction indicator ─────────────────────────────────────────

  it("shows ascending sort icon on sorted column", () => {
    render(
      <DataTable<TestRow>
        data={testRows}
        columns={makeSortableColumns()}
        getRowId={getRowId}
        sorts={[{ field: "name", direction: "asc" }]}
      />,
    )

    // The Name column header should contain a visible sort direction indicator.
    // Look for an ascending sort indicator near the "Name" header.
    const nameHeader = screen.getByText("Name").closest("th")
    expect(nameHeader).not.toBeNull()

    // The sort indicator should be present (typically an SVG icon or text indicator).
    // Check for an element with aria-label or role indicating sort direction,
    // or check for the presence of a sort icon element within the header.
    const sortIndicator = nameHeader!.querySelector(
      '[aria-label*="sort"], [aria-label*="ascending"], svg',
    )
    expect(sortIndicator).not.toBeNull()
  })

  // ── 10. Pagination text ─────────────────────────────────────────────────

  it('shows correct "Showing X-Y of Z" pagination text', () => {
    render(
      <DataTable<TestRow>
        data={testRows}
        columns={makeColumns()}
        getRowId={getRowId}
        total={50}
        page={2}
        pageSize={10}
      />,
    )

    // Should show "Showing 11-20 of 50" (or with en-dash: "Showing 11\u201320 of 50")
    const paginationText = screen.getByText(/Showing\s+11[\u2013\u2014-]20\s+of\s+50/)
    expect(paginationText).toBeInTheDocument()
  })

  // ── 11. Page boundary ───────────────────────────────────────────────────

  it("disables both previous and next buttons when all data fits on one page", () => {
    render(
      <DataTable<TestRow>
        data={testRows}
        columns={makeColumns()}
        getRowId={getRowId}
        total={10}
        page={1}
        pageSize={10}
      />,
    )

    // Previous button should be disabled on page 1
    const prevButton = screen.getByRole("button", { name: /previous/i })
    expect(prevButton).toBeDisabled()

    // Next button should be disabled when total <= page * pageSize
    const nextButton = screen.getByRole("button", { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  // ── 12. No selection column ─────────────────────────────────────────────

  it("renders no checkboxes when selectedIds and onSelectionChange not provided", () => {
    render(<DataTable<TestRow> data={testRows} columns={makeColumns()} getRowId={getRowId} />)

    // No checkboxes should be present anywhere in the table
    const checkboxes = screen.queryAllByRole("checkbox")
    expect(checkboxes).toHaveLength(0)
  })

  // ── 13. No pagination ──────────────────────────────────────────────────

  it("renders no pagination footer when total prop is not provided", () => {
    render(<DataTable<TestRow> data={testRows} columns={makeColumns()} getRowId={getRowId} />)

    // No pagination text or navigation buttons should exist
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument()
  })
})
