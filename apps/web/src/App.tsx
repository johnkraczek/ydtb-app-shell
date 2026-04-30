import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderInput,
  Grid2x2,
  HardDrive,
  House,
  Image,
  LayoutDashboard,
  Link2,
  List,
  PanelsLeftRight,
  Pencil,
  Scissors,
  Search,
  Settings2,
  Share2,
  Shield,
  Star,
  Tag,
  Trash2,
  Upload,
  Users,
  Clipboard,
  ArrowUpRight,
} from "lucide-react"
import type {
  AppShellModel,
  BreadcrumbModel,
  InspectorActionModel,
  ListingItemModel,
  RailItemModel,
  StorageScenarioModel,
  TreeNodeModel,
  ViewModeOptionModel,
} from "@ydtb/storage-static-contracts"
import { EmptyMessage, SectionTitle, ShellButton, ShellCard, ShellPill } from "@ydtb/ui"
import { getScenarioById, scenarios } from "./fixtures/scenarios"

const iconMap = {
  ArrowUpRight,
  CircleHelp,
  Clock3,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderInput,
  Grid2x2,
  HardDrive,
  House,
  Image,
  LayoutDashboard,
  Link2,
  List,
  PanelsLeftRight,
  Pencil,
  Scissors,
  Search,
  Settings2,
  Share2,
  Shield,
  Star,
  Tag,
  Trash2,
  Upload,
  Users,
  Clipboard,
} as const

function resolveIcon(name?: string | null) {
  if (!name) return Folder
  return iconMap[name as keyof typeof iconMap] ?? Folder
}

function Rail({ shell }: { shell: AppShellModel }) {
  return (
    <aside className="rail">
      <div className="rail__brand">{shell.productName}</div>
      <div className="rail__items">
        {shell.topRailItems.map((item) => (
          <RailButton key={item.id} item={item} />
        ))}
      </div>
      <div className="rail__spacer" />
      <div className="rail__items rail__items--bottom">
        {shell.bottomRailItems.map((item) => (
          <RailButton key={item.id} item={item} />
        ))}
      </div>
    </aside>
  )
}

function RailButton({ item }: { item: RailItemModel }) {
  const Icon = resolveIcon(item.icon)
  return (
    <button className={["rail__button", item.active ? "rail__button--active" : ""].join(" ")}>
      <Icon size={18} />
      <span className="sr-only">{item.label}</span>
    </button>
  )
}

function GlobalHeader({ shell }: { shell: AppShellModel }) {
  return (
    <header className="global-header">
      <div className="workspace-pill">
        <div className="workspace-pill__badge">{shell.workspaceShortName}</div>
        <div>
          <div className="workspace-pill__title">{shell.workspaceName}</div>
          <div className="workspace-pill__subtitle">{shell.workspacePlan}</div>
        </div>
      </div>
      <div className="global-search">
        <Search size={16} />
        <span>{shell.globalSearchPlaceholder}</span>
      </div>
      <div className="global-header__right">Preview shell</div>
    </header>
  )
}

function Sidebar({ scenario }: { scenario: StorageScenarioModel }) {
  const { sidebar } = scenario
  return (
    <aside className="storage-sidebar">
      <div className="storage-sidebar__header">
        <h2>{sidebar.title}</h2>
        <button className="ghost-icon-button" type="button">
          <ChevronRight size={16} />
        </button>
      </div>

      <section>
        <SectionTitle>Favorites</SectionTitle>
        <div className="sidebar-list">
          {sidebar.favorites.map((item) => (
            <SidebarRow key={item.id} label={item.label} icon={item.icon ?? "Star"} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Folders</SectionTitle>
        <div className="sidebar-tree">
          <TreeNodes nodes={sidebar.tree} depth={0} />
        </div>
      </section>

      <section>
        <SectionTitle>Shared</SectionTitle>
        <div className="sidebar-list">
          {sidebar.shared.map((item) => (
            <SidebarRow key={item.id} label={item.label} icon={item.icon ?? "Users"} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Recent</SectionTitle>
        <div className="sidebar-list">
          {sidebar.recent.map((item) => (
            <SidebarRow key={item.id} label={item.label} icon={item.icon ?? "Clock3"} />
          ))}
        </div>
      </section>

      <div className="sidebar-actions">
        <ShellButton tone="ghost">{sidebar.selectActionLabel}</ShellButton>
        <ShellButton tone="secondary">{sidebar.uploadActionLabel}</ShellButton>
      </div>

      <ShellCard className="usage-card">
        <div className="usage-card__header">
          <span>Storage</span>
          <strong>{sidebar.usage.percentUsed}%</strong>
        </div>
        <div className="usage-card__meter">
          <div className="usage-card__meter-fill" style={{ width: `${sidebar.usage.percentUsed}%` }} />
        </div>
        <div className="usage-card__summary">
          {sidebar.usage.usedLabel} of {sidebar.usage.totalLabel} used
        </div>
        <div className="usage-card__context">{sidebar.usage.billingContextLabel}</div>
        {sidebar.usage.ctaLabel ? <ShellButton tone="primary">{sidebar.usage.ctaLabel}</ShellButton> : null}
      </ShellCard>
    </aside>
  )
}

function SidebarRow({ label, icon }: { label: string; icon: string }) {
  const Icon = resolveIcon(icon)
  return (
    <div className="sidebar-row">
      <Icon size={14} />
      <span>{label}</span>
    </div>
  )
}

function TreeNodes({ nodes, depth }: { nodes: TreeNodeModel[]; depth: number }) {
  return (
    <>
      {nodes.map((node) => {
        const Icon = resolveIcon(node.kind === "folder" ? "Folder" : "FileText")
        return (
          <div key={node.id}>
            <div className={["tree-row", node.selected ? "tree-row--selected" : ""].join(" ")} style={{ paddingLeft: 10 + depth * 16 }}>
              {node.children?.length ? (
                node.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              ) : (
                <span className="tree-row__caret-spacer" />
              )}
              <Icon size={14} />
              <span>{node.name}</span>
              {node.itemCount ? <span className="tree-row__count">{node.itemCount}</span> : null}
            </div>
            {node.expanded && node.children?.length ? <TreeNodes nodes={node.children} depth={depth + 1} /> : null}
          </div>
        )
      })}
    </>
  )
}

function StorageHeader({ scenario }: { scenario: StorageScenarioModel }) {
  const { header } = scenario
  return (
    <div className="storage-header">
      <div className="storage-header__nav">
        <button className="ghost-icon-button" type="button" disabled={!header.canGoBack}>
          <ArrowLeft size={16} />
        </button>
        <button className="ghost-icon-button" type="button" disabled={!header.canGoForward}>
          <ArrowRight size={16} />
        </button>
        <button className="ghost-icon-button" type="button">
          <House size={16} />
        </button>
        <Breadcrumbs breadcrumbs={header.breadcrumbs} />
      </div>

      <div className="storage-header__controls">
        <div className="view-mode-group">
          {header.views.map((view) => (
            <ViewModeButton key={view.id} view={view} />
          ))}
        </div>
        <div className="local-search">
          <Search size={16} />
          <span>{header.searchQuery || header.searchPlaceholder}</span>
        </div>
        {header.actions.map((action) => (
          <ShellButton key={action.id} tone={action.kind} icon={action.icon ? ReactIcon(action.icon) : undefined}>
            {action.label}
          </ShellButton>
        ))}
      </div>
    </div>
  )
}

function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbModel[] }) {
  return (
    <div className="breadcrumbs">
      {breadcrumbs.map((crumb, index) => (
        <div className="breadcrumbs__item" key={crumb.id}>
          {index > 0 ? <ChevronRight size={14} /> : null}
          <span className={index === breadcrumbs.length - 1 ? "breadcrumbs__item--active" : undefined}>{crumb.label}</span>
        </div>
      ))}
    </div>
  )
}

function ViewModeButton({ view }: { view: ViewModeOptionModel }) {
  const Icon = view.id === "grid" ? Grid2x2 : view.id === "list" ? List : PanelsLeftRight
  return (
    <button className={["view-mode-button", view.active ? "view-mode-button--active" : ""].join(" ")} type="button">
      <Icon size={15} />
      <span className="sr-only">{view.label}</span>
    </button>
  )
}

function ContentPane({ scenario }: { scenario: StorageScenarioModel }) {
  const { content } = scenario
  if (content.emptyState) {
    return (
      <ShellCard className="content-pane content-pane--empty">
        <EmptyMessage title={content.emptyStateTitle ?? "Nothing here yet"} body={content.emptyStateBody} />
      </ShellCard>
    )
  }

  if (content.viewMode === "list") {
    return (
      <ShellCard className={["content-pane", content.dragState !== "idle" ? `content-pane--${content.dragState}` : ""].join(" ")}>
        <ListingTable columns={content.columns} items={content.items} selectedIds={scenario.selection.selectedIds} />
      </ShellCard>
    )
  }

  if (content.viewMode === "columns") {
    return (
      <ShellCard className={["content-pane content-pane--columns", content.dragState !== "idle" ? `content-pane--${content.dragState}` : ""].join(" ")}>
        {content.columnGroups?.map((group) => (
          <div className="column-group" key={group.id}>
            <div className="column-group__title">{group.title}</div>
            {group.items.map((item) => (
              <ColumnRow key={item.id} item={item} selected={scenario.selection.selectedIds.includes(item.id)} />
            ))}
          </div>
        ))}
      </ShellCard>
    )
  }

  return (
    <ShellCard className={["content-pane content-pane--grid", content.dragState !== "idle" ? `content-pane--${content.dragState}` : ""].join(" ")}>
      <div className="grid-items">
        {content.items.map((item) => (
          <GridCard key={item.id} item={item} selected={scenario.selection.selectedIds.includes(item.id)} />
        ))}
      </div>
    </ShellCard>
  )
}

function GridCard({ item, selected }: { item: ListingItemModel; selected: boolean }) {
  const Icon = resolveIcon(item.icon ?? (item.kind === "folder" ? "Folder" : item.kind === "shortcut" ? "ArrowUpRight" : "FileText"))
  return (
    <div className={["grid-card", selected ? "grid-card--selected" : ""].join(" ")}>
      <div className="grid-card__preview">
        {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.name} /> : <Icon size={48} />}
      </div>
      <div className="grid-card__name">{item.name}</div>
      <div className="grid-card__meta">{item.childCountLabel ?? item.sizeLabel ?? item.statusLabel ?? item.modifiedLabel}</div>
    </div>
  )
}

function ListingTable({
  columns,
  items,
  selectedIds,
}: {
  columns: { id: string; label: string }[]
  items: ListingItemModel[]
  selectedIds: string[]
}) {
  return (
    <div className="listing-table">
      <div className="listing-table__header">
        {columns.map((column) => (
          <div key={column.id}>{column.label}</div>
        ))}
      </div>
      {items.map((item) => {
        const Icon = resolveIcon(item.icon ?? (item.kind === "file" ? "FileText" : "Folder"))
        return (
          <div className={["listing-table__row", selectedIds.includes(item.id) ? "listing-table__row--selected" : ""].join(" ")} key={item.id}>
            <div className="listing-table__name">
              {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.name} /> : <Icon size={18} />}
              <span>{item.name}</span>
            </div>
            <div>{item.modifiedLabel ?? "—"}</div>
            <div>{item.sizeLabel ?? item.childCountLabel ?? "—"}</div>
            <div>{item.statusLabel ?? item.kind}</div>
          </div>
        )
      })}
    </div>
  )
}

function ColumnRow({ item, selected }: { item: ListingItemModel; selected: boolean }) {
  const Icon = resolveIcon(item.icon ?? (item.kind === "file" ? "FileText" : item.kind === "folder" ? "Folder" : "ArrowUpRight"))
  return (
    <div className={["column-row", selected ? "column-row--selected" : ""].join(" ")}>
      <Icon size={16} />
      <span>{item.name}</span>
      {item.kind === "folder" ? <ChevronRight size={14} /> : null}
    </div>
  )
}

function Inspector({ scenario }: { scenario: StorageScenarioModel }) {
  const { inspector } = scenario
  return (
    <aside className="inspector">
      {inspector.state === "empty" ? (
        <EmptyMessage title={inspector.title} />
      ) : (
        <>
          <div className="inspector__preview">
            {inspector.previewUrl ? (
              <img src={inspector.previewUrl} alt={inspector.title} />
            ) : (
              <div className="inspector__preview-icon">
                {(() => {
                  const Icon = resolveIcon(inspector.previewIcon ?? "Folder")
                  return <Icon size={54} />
                })()}
              </div>
            )}
          </div>
          <div className="inspector__title">{inspector.title}</div>
          {inspector.subtitle ? <div className="inspector__subtitle">{inspector.subtitle}</div> : null}
          <div className="inspector__tabs">
            {inspector.tabs.map((tab) => (
              <ShellPill key={tab.id} active={tab.active}>
                {tab.label}
              </ShellPill>
            ))}
          </div>
          <div className="inspector__meta">
            {inspector.metadata.map((entry) => (
              <div className="inspector__meta-row" key={entry.label}>
                <span>{entry.label}</span>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
          <div className="inspector__actions">
            {inspector.actions.map((action) => (
              <InspectorButton key={action.id} action={action} />
            ))}
          </div>
        </>
      )}
    </aside>
  )
}

function InspectorButton({ action }: { action: InspectorActionModel }) {
  return <ShellButton tone={action.kind === "danger" ? "danger" : action.kind === "primary" ? "primary" : "secondary"}>{action.label}</ShellButton>
}

function ContextMenuOverlay({ scenario }: { scenario: StorageScenarioModel }) {
  if (!scenario.contextMenu?.open) return null
  return (
    <div className="context-menu">
      <div className="context-menu__title">{scenario.contextMenu.subjectLabel}</div>
      {scenario.contextMenu.actions.map((action) => (
        <div className={["context-menu__row", action.tone === "danger" ? "context-menu__row--danger" : ""].join(" ")} key={action.id}>
          <div className="context-menu__row-left">
            {action.icon ? ReactIcon(action.icon) : null}
            <span>{action.label}</span>
          </div>
          {action.shortcut ? <span className="context-menu__shortcut">{action.shortcut}</span> : null}
        </div>
      ))}
    </div>
  )
}

function UploadModalOverlay({ scenario }: { scenario: StorageScenarioModel }) {
  const modal = scenario.uploadModal
  if (!modal?.open) return null
  return (
    <div className="modal-overlay">
      <ShellCard className="upload-modal">
        <div className="upload-modal__header">
          <h3>{modal.title}</h3>
        </div>
        <div className="upload-modal__body">
          <div className="upload-modal__tree">
            <TreeNodes nodes={modal.destinationTree} depth={0} />
          </div>
          <div className="upload-modal__dropzone">
            <Upload size={24} />
            <div className="upload-modal__dropzone-title">{modal.dropzoneTitle}</div>
            <div className="upload-modal__dropzone-body">{modal.dropzoneBody}</div>
          </div>
        </div>
        <div className="upload-modal__footer">
          <ShellButton tone="ghost">{modal.secondaryActionLabel}</ShellButton>
          <ShellButton tone="primary">{modal.primaryActionLabel}</ShellButton>
        </div>
      </ShellCard>
    </div>
  )
}

function ReactIcon(name: string) {
  const Icon = resolveIcon(name)
  return <Icon size={16} />
}

export default function App() {
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0].id)
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId])

  return (
    <div className="app-root">
      <GlobalHeader shell={scenario.shell} />
      <div className="app-layout">
        <Rail shell={scenario.shell} />
        <div className="storage-shell">
          <Sidebar scenario={scenario} />
          <main className="storage-main">
            <StorageHeader scenario={scenario} />
            <ContentPane scenario={scenario} />
          </main>
          <Inspector scenario={scenario} />
        </div>
      </div>

      <ContextMenuOverlay scenario={scenario} />
      <UploadModalOverlay scenario={scenario} />

      <div className="scenario-switcher">
        <label htmlFor="scenario-select">Scenario</label>
        <select id="scenario-select" value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
          {scenarios.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
