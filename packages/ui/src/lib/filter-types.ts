// ── Filter Types ──────────────────────────────────────────────────────────
// Shared filter type definitions extracted from @ydtb/contacts for reuse
// across all tools that implement filterable DataTables.

export type FilterOperator =
  | "is"
  | "is_not"
  | "contains"
  | "does_not_contain"
  | "starts_with"
  | "ends_with"
  | "regex"
  | "is_empty"
  | "is_not_empty"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "is_before"
  | "is_after"
  | "is_on_or_before"
  | "is_on_or_after"

export type FilterCondition = {
  id: string
  fieldKey: string
  operator: FilterOperator
  value?: string
}

export type FilterGroup = {
  id: string
  logic: "and" | "or"
  conditions: (FilterCondition | FilterGroup)[]
}

export type FilterConfig = FilterGroup

export type OperatorsByFieldType = Record<string, FilterOperator[]>

export type FilterFieldDef = {
  key: string
  label: string
  type: string
  group?: string
  options?: { value: string; label: string }[]
}
