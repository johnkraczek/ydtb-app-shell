export { BulkActionBar } from "./components/bulk-action-bar.tsx"
export type { BulkActionBarProps } from "./components/bulk-action-bar.tsx"
export { TabbedPanel } from "./components/tabbed-panel.tsx"
export type { TabbedPanelProps, TabbedPanelTab } from "./components/tabbed-panel.tsx"

// DataTable
export { DataTable } from "./components/data-table/index.ts"
export type { ColumnDef, SortConfig, DataTableProps } from "./components/data-table/index.ts"

// InlineCellEditor
export { InlineCellEditor } from "./components/data-table/index.ts"
export type {
  InlineCellEditorProps,
  FieldType,
  FieldOption,
} from "./components/data-table/index.ts"

// Settings
export {
  SettingsLayout,
  SettingsSidebar,
  SettingsCard,
  SettingsField,
} from "./components/settings/index.ts"
export type {
  SettingsLayoutProps,
  SettingsSidebarProps,
  SettingsSidebarSection,
  SettingsSidebarItem,
  SettingsCardProps,
  SettingsFieldProps,
} from "./components/settings/index.ts"

// Table hooks
export { useTableSearch } from "./hooks/use-table-search.ts"
export { useTablePagination } from "./hooks/use-table-pagination.ts"
export { useTableSort } from "./hooks/use-table-sort.ts"
export { useTableSelection } from "./hooks/use-table-selection.ts"

// Inheritance indicator (cross-scope inheritance UI)
export { InheritanceIndicator } from "./components/inheritance-indicator.tsx"
export type {
  InheritanceIndicatorProps,
  InheritanceState,
} from "./components/inheritance-indicator.tsx"

// Share-with-descendants toggle (parent-scope opt-in for cross-scope sharing)
export { ShareWithDescendantsToggle } from "./components/share-with-descendants-toggle.tsx"
export type { ShareWithDescendantsToggleProps } from "./components/share-with-descendants-toggle.tsx"
