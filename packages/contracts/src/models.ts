export type RailItemId =
  | "dashboard"
  | "contacts"
  | "storage"
  | "team"
  | "settings"
  | "search"
  | "notifications"
  | "support"
  | "billing"

export interface RailItemModel {
  id: RailItemId | string
  label: string
  icon: string
  active?: boolean
  position?: "top" | "bottom"
}

export interface AppShellModel {
  productName: string
  workspaceName: string
  workspaceShortName: string
  workspacePlan: string
  globalSearchPlaceholder: string
  topRailItems: RailItemModel[]
  bottomRailItems: RailItemModel[]
}

export interface CurrentScopeModel {
  id: string
  type: "company" | "location" | string
  name: string
  slug: string
  billingOwnerLabel: string
}

export interface TreeNodeModel {
  id: string
  name: string
  kind: "folder" | "file" | "shortcut"
  path: string
  expanded?: boolean
  selected?: boolean
  favorited?: boolean
  itemCount?: number
  children?: TreeNodeModel[]
}

export interface SidebarSectionItemModel {
  id: string
  label: string
  path: string
  icon?: string
}

export interface StorageUsageModel {
  usedLabel: string
  totalLabel: string
  percentUsed: number
  ctaLabel?: string
  billingContextLabel?: string
  warningState?: "normal" | "warning" | "danger"
}

export interface StorageSidebarModel {
  title: string
  rootLabel: string
  favorites: SidebarSectionItemModel[]
  shared: SidebarSectionItemModel[]
  recent: SidebarSectionItemModel[]
  tree: TreeNodeModel[]
  uploadActionLabel: string
  selectActionLabel: string
  usage: StorageUsageModel
}

export interface BreadcrumbModel {
  id: string
  label: string
  path: string
  kind: "home" | "folder" | "file"
}

export interface ViewModeOptionModel {
  id: "grid" | "list" | "columns"
  label: string
  active: boolean
}

export interface ToolbarActionModel {
  id: string
  label: string
  kind: "primary" | "secondary" | "ghost"
  icon?: string
}

export interface BulkActionModel {
  id: string
  label: string
  icon?: string
}

export interface SearchScopeOptionModel {
  id: "current-folder" | "whole-library"
  label: string
  active: boolean
}

export interface StorageHeaderModel {
  canGoBack: boolean
  canGoForward: boolean
  breadcrumbs: BreadcrumbModel[]
  searchPlaceholder: string
  searchQuery: string
  searchScopes: SearchScopeOptionModel[]
  filters: string[]
  sortLabel: string
  views: ViewModeOptionModel[]
  actions: ToolbarActionModel[]
  bulkActions: BulkActionModel[]
}

export interface ListingItemModel {
  id: string
  kind: "folder" | "file" | "shortcut"
  name: string
  path: string
  thumbnailUrl?: string | null
  icon?: string | null
  mimeType?: string | null
  extension?: string | null
  modifiedLabel?: string | null
  sizeLabel?: string | null
  childCountLabel?: string | null
  statusLabel?: string | null
}

export interface ListingColumnModel {
  id: string
  label: string
}

export interface StorageContentModel {
  viewMode: "grid" | "list" | "columns"
  emptyState: boolean
  emptyStateTitle?: string
  emptyStateBody?: string
  dragState: "idle" | "drag-target" | "drag-invalid" | "upload-overlay"
  columns: ListingColumnModel[]
  items: ListingItemModel[]
  columnGroups?: Array<{
    id: string
    title: string
    items: ListingItemModel[]
  }>
}

export interface SelectionModel {
  mode: "none" | "single" | "multi"
  selectedIds: string[]
  primaryId: string | null
}

export interface InspectorTabModel {
  id: string
  label: string
  active: boolean
}

export interface InspectorActionModel {
  id: string
  label: string
  kind: "primary" | "secondary" | "danger"
}

export interface StorageInspectorModel {
  state: "empty" | "folder" | "file"
  title: string
  subtitle?: string
  previewUrl?: string | null
  previewIcon?: string | null
  metadata: Array<{ label: string; value: string }>
  tabs: InspectorTabModel[]
  actions: InspectorActionModel[]
}

export interface ContextMenuActionModel {
  id: string
  label: string
  icon?: string
  shortcut?: string
  tone?: "default" | "danger"
}

export interface StorageContextMenuModel {
  open: boolean
  subjectId: string
  subjectLabel: string
  actions: ContextMenuActionModel[]
}

export interface UploadModalModel {
  open: boolean
  title: string
  destinationLabel: string
  destinationTree: TreeNodeModel[]
  dropzoneTitle: string
  dropzoneBody: string
  primaryActionLabel: string
  secondaryActionLabel: string
}

export interface StorageScenarioModel {
  id: string
  label: string
  shell: AppShellModel
  currentScope: CurrentScopeModel
  sidebar: StorageSidebarModel
  header: StorageHeaderModel
  content: StorageContentModel
  selection: SelectionModel
  inspector: StorageInspectorModel
  contextMenu: StorageContextMenuModel | null
  uploadModal: UploadModalModel | null
}
