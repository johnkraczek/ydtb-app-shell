import { useState, useMemo, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical, Search, Type } from "lucide-react"

import { Input } from "./input.tsx"
import { Switch } from "./switch.tsx"
import type { ColumnConfig } from "../lib/column-config.ts"
import { toggleColumnVisibility, reorderColumns, hideAllColumns } from "../lib/column-config.ts"

// ── CSS Transform helper ──────────────────────────────────────────────────

function cssTransformToString(
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
): string | undefined {
  if (!transform) return undefined
  return `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
}

// ── Sortable Field Row ──────────────────────────────────────────────────

function SortableFieldRow({
  column,
  onToggle,
}: {
  column: ColumnConfig
  onToggle: (fieldKey: string) => void
}) {
  const isLocked = column.locked === true

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.fieldKey,
    disabled: isLocked,
  })

  const style: React.CSSProperties = {
    transform: cssTransformToString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const Icon = column.icon ?? Type

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 group"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex items-center justify-center w-5 h-5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground"
        style={{
          visibility: isLocked ? "hidden" : "visible",
        }}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Type icon */}
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      {/* Field name */}
      <span className="flex-1 text-sm text-foreground truncate">{column.label}</span>

      {/* Toggle switch */}
      <Switch
        checked={column.visible}
        onCheckedChange={() => onToggle(column.fieldKey)}
        disabled={isLocked}
      />
    </div>
  )
}

// ── Hidden Field Row ────────────────────────────────────────────────────

function HiddenFieldRow({
  column,
  onToggle,
}: {
  column: ColumnConfig
  onToggle: (fieldKey: string) => void
}) {
  const Icon = column.icon ?? Type

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50">
      {/* Spacer for alignment with shown section (drag handle space) */}
      <div className="w-5 shrink-0" />

      {/* Type icon */}
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      {/* Field name */}
      <span className="flex-1 text-sm text-muted-foreground truncate">{column.label}</span>

      {/* Toggle switch */}
      <Switch checked={false} onCheckedChange={() => onToggle(column.fieldKey)} />
    </div>
  )
}

// ── ColumnConfigPanel ───────────────────────────────────────────────────

export interface ColumnConfigPanelProps {
  columns: ColumnConfig[]
  onColumnsChange: (columns: ColumnConfig[]) => void
  onCreateField?: () => void
  footer?: React.ReactNode
}

export function ColumnConfigPanel({ columns, onColumnsChange, footer }: ColumnConfigPanelProps) {
  const [search, setSearch] = useState("")

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  )

  // Partition columns into shown and hidden
  const { shownColumns, hiddenColumns } = useMemo(() => {
    const sorted = [...columns].sort((a, b) => a.position - b.position)
    const shown = sorted.filter((c) => c.visible)
    const hidden = sorted.filter((c) => !c.visible)
    return { shownColumns: shown, hiddenColumns: hidden }
  }, [columns])

  // Apply search filter
  const filteredShown = useMemo(() => {
    if (!search.trim()) return shownColumns
    const q = search.toLowerCase()
    return shownColumns.filter((c) => c.label.toLowerCase().includes(q))
  }, [shownColumns, search])

  const filteredHidden = useMemo(() => {
    if (!search.trim()) return hiddenColumns
    const q = search.toLowerCase()
    return hiddenColumns.filter((c) => c.label.toLowerCase().includes(q))
  }, [hiddenColumns, search])

  // Toggle column visibility
  const handleToggle = useCallback(
    (fieldKey: string) => {
      onColumnsChange(toggleColumnVisibility(columns, fieldKey))
    },
    [columns, onColumnsChange],
  )

  // Hide all columns except locked
  const handleHideAll = useCallback(() => {
    onColumnsChange(hideAllColumns(columns))
  }, [columns, onColumnsChange])

  // Drag-and-drop reorder
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const fromIndex = columns.findIndex((c) => c.fieldKey === active.id)
      const toIndex = columns.findIndex((c) => c.fieldKey === over.id)

      if (fromIndex === -1 || toIndex === -1) return

      onColumnsChange(reorderColumns(columns, fromIndex, toIndex))
    },
    [columns, onColumnsChange],
  )

  return (
    <div className="flex flex-col h-full">
      {/* Search box */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for new or existing fields"
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Scrollable field list */}
      <div className="flex-1 overflow-y-auto px-1">
        {/* Shown section */}
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shown ({filteredShown.length})
            </span>
            <button
              type="button"
              onClick={handleHideAll}
              className="text-xs font-medium transition-colors text-primary"
            >
              Hide all
            </button>
          </div>
        </div>

        {filteredShown.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredShown.map((c) => c.fieldKey)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0.5">
                {filteredShown.map((column) => (
                  <SortableFieldRow key={column.fieldKey} column={column} onToggle={handleToggle} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-sm text-muted-foreground px-4 py-3">
            {search.trim() ? "No matching shown fields" : "No shown fields"}
          </p>
        )}

        {/* Divider */}
        <div className="mx-4 my-3 border-t border-border" />

        {/* Hidden section */}
        <div className="px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hidden ({filteredHidden.length})
          </span>
        </div>

        {filteredHidden.length > 0 ? (
          <div className="space-y-0.5 mt-1">
            {filteredHidden.map((column) => (
              <HiddenFieldRow key={column.fieldKey} column={column} onToggle={handleToggle} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground px-4 py-3">
            {search.trim() ? "No matching hidden fields" : "No hidden fields"}
          </p>
        )}
      </div>

      {/* Footer */}
      {footer && <div className="px-4 py-3 border-t border-border shrink-0">{footer}</div>}
    </div>
  )
}
