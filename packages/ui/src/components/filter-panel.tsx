// useMemo removed — not currently used
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@ydtb/tk-scope-ui/components/select"
import { Input } from "@ydtb/tk-scope-ui/components/input"
import { Plus, X, Trash2, Info, CornerDownRight } from "lucide-react"
import type {
  FilterConfig,
  FilterCondition,
  FilterGroup,
  FilterOperator,
  FilterFieldDef,
  OperatorsByFieldType,
} from "@ydtb/tk-scope-ui/lib/filter-types"

// ─── Re-export types for convenience ──────────────────────────────
export type { FilterFieldDef } from "@ydtb/tk-scope-ui/lib/filter-types"

// ─── Props ────────────────────────────────────────────────────────

export interface FilterPanelProps {
  filters: FilterConfig | undefined
  onFiltersChange: (filters: FilterConfig | undefined) => void
  fields: FilterFieldDef[]
  operatorsByFieldType: OperatorsByFieldType
}

// ─── Operator Labels ──────────────────────────────────────────────

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  is: "Is",
  is_not: "Is not",
  contains: "Contains",
  does_not_contain: "Does not contain",
  starts_with: "Starts with",
  ends_with: "Ends with",
  regex: "Regex",
  is_empty: "Is empty",
  is_not_empty: "Is not empty",
  greater_than: "Greater than",
  less_than: "Less than",
  greater_than_or_equal: "Greater than or equal",
  less_than_or_equal: "Less than or equal",
  is_before: "Is before",
  is_after: "Is after",
  is_on_or_before: "Is on or before",
  is_on_or_after: "Is on or after",
}

// ─── Helpers ──────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID().slice(0, 12)
}

function isFilterGroup(item: FilterCondition | FilterGroup): item is FilterGroup {
  return "conditions" in item
}

function countConditions(config: FilterConfig): number {
  let count = 0
  for (const item of config.conditions) {
    if (isFilterGroup(item)) {
      count += countConditions(item)
    } else {
      count += 1
    }
  }
  return count
}

function shouldHideValue(operator: FilterOperator): boolean {
  return operator === "is_empty" || operator === "is_not_empty"
}

// ─── Value Input ──────────────────────────────────────────────────

function FilterValueInput({
  fieldType,
  value,
  onChange,
  fieldOptions,
}: {
  fieldType: string
  value: string | undefined
  onChange: (value: string) => void
  fieldOptions?: Array<{ value: string; label: string }>
}) {
  switch (fieldType) {
    case "number":
    case "money":
      return (
        <Input
          type="number"
          placeholder="Enter value..."
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm flex-1 min-w-0"
        />
      )

    case "date":
      return (
        <Input
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm flex-1 min-w-0"
        />
      )

    case "dropdown":
    case "labels":
      return (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-sm flex-1 min-w-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {(fieldOptions ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "checkbox":
      return (
        <Select value={value ?? "true"} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-sm flex-1 min-w-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      )

    default:
      return (
        <Input
          type="text"
          placeholder="Enter value..."
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm flex-1 min-w-0"
        />
      )
  }
}

// ─── Field Selector ───────────────────────────────────────────────

function FieldSelector({
  value,
  onValueChange,
  fields,
}: {
  value: string
  onValueChange: (value: string) => void
  fields: FilterFieldDef[]
}) {
  const ungrouped = fields.filter((f) => !f.group)
  const grouped = fields.filter((f) => f.group)
  const groups = [...new Set(grouped.map((f) => f.group!))]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 text-sm flex-1 min-w-0">
        <SelectValue placeholder="Field..." />
      </SelectTrigger>
      <SelectContent>
        {ungrouped.length > 0 && (
          <SelectGroup>
            <SelectLabel>Base Fields</SelectLabel>
            {ungrouped.map((f) => (
              <SelectItem key={f.key} value={f.key}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {groups.map((group) => (
          <SelectGroup key={group}>
            <SelectSeparator />
            <SelectLabel>{group}</SelectLabel>
            {grouped
              .filter((f) => f.group === group)
              .map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.label}
                </SelectItem>
              ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Filter Condition Card ────────────────────────────────────────
//
// Vertical card: field selector full-width on top, operator + value
// row beneath. Trash button absolute top-right (hover-fade) so the
// row layout never has to budget space for it. This is the layout
// pattern the prior Contacts FilterConditionCard used — restored to
// keep the shared FilterPanel usable inside narrow drawer columns
// (~360px) where the prior horizontal-row layout overflowed.

function FilterConditionCard({
  condition,
  fields,
  operatorsByFieldType,
  onUpdate,
  onRemove,
}: {
  condition: FilterCondition
  fields: FilterFieldDef[]
  operatorsByFieldType: OperatorsByFieldType
  onUpdate: (updated: FilterCondition) => void
  onRemove: () => void
}) {
  const selectedField = fields.find((f) => f.key === condition.fieldKey)
  const fieldType = selectedField?.type ?? "text"
  const operators = operatorsByFieldType[fieldType] ?? []
  const hideValue = shouldHideValue(condition.operator)

  const handleFieldChange = (fieldKey: string) => {
    const newField = fields.find((f) => f.key === fieldKey)
    const newType = newField?.type ?? "text"
    const newOperators = operatorsByFieldType[newType] ?? []
    const newOperator = newOperators.includes(condition.operator)
      ? condition.operator
      : (newOperators[0] ?? "is")
    onUpdate({
      ...condition,
      fieldKey,
      operator: newOperator,
      value: undefined,
    })
  }

  const handleOperatorChange = (operator: string) => {
    const op = operator as FilterOperator
    onUpdate({
      ...condition,
      operator: op,
      value: shouldHideValue(op) ? undefined : condition.value,
    })
  }

  const handleValueChange = (value: string) => {
    onUpdate({ ...condition, value })
  }

  return (
    <div className="group/card relative rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all z-10 opacity-0 scale-90 group-hover/card:opacity-100 group-hover/card:scale-100"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="px-2.5 pt-2.5 pb-1.5">
        <FieldSelector
          value={condition.fieldKey}
          onValueChange={handleFieldChange}
          fields={fields}
        />
      </div>

      <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
        <Select value={condition.operator} onValueChange={handleOperatorChange}>
          <SelectTrigger
            className={`h-8 text-sm ${hideValue ? "flex-1 min-w-0" : "w-[130px] shrink-0"}`}
          >
            <SelectValue placeholder="Operator..." />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!hideValue && (
          <FilterValueInput
            fieldType={fieldType}
            value={condition.value}
            onChange={handleValueChange}
            fieldOptions={selectedField?.options}
          />
        )}
      </div>
    </div>
  )
}

// ─── Logic Connector ──────────────────────────────────────────────
//
// Centered AND/OR Select between sibling conditions. Used both at the
// top level (between root-level rules) and inside FilterGroupBlock
// (between conditions in the same group).

function LogicConnector({
  logic,
  onLogicChange,
}: {
  logic: "and" | "or"
  onLogicChange: (logic: "and" | "or") => void
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-1 h-px bg-border" />
      <Select value={logic} onValueChange={(v) => onLogicChange(v as "and" | "or")}>
        <SelectTrigger className="h-7 w-[72px] text-xs font-medium px-2 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="and">AND</SelectItem>
          <SelectItem value="or">OR</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Filter Group Block ──────────────────────────────────────────

function FilterGroupBlock({
  group,
  fields,
  operatorsByFieldType,
  onUpdate,
  onRemove,
  onAddCondition,
  depth,
}: {
  group: FilterGroup
  fields: FilterFieldDef[]
  operatorsByFieldType: OperatorsByFieldType
  onUpdate: (updated: FilterGroup) => void
  onRemove?: () => void
  onAddCondition: () => void
  depth: number
}) {
  const handleConditionUpdate = (index: number, updated: FilterCondition) => {
    const newConditions = [...group.conditions]
    newConditions[index] = updated
    onUpdate({ ...group, conditions: newConditions })
  }

  const handleGroupUpdate = (index: number, updated: FilterGroup) => {
    const newConditions = [...group.conditions]
    newConditions[index] = updated
    onUpdate({ ...group, conditions: newConditions })
  }

  const handleRemoveItem = (index: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== index)
    onUpdate({ ...group, conditions: newConditions })
  }

  const handleAddNestedCondition = (groupIndex: number) => {
    const child = group.conditions[groupIndex]
    if (!child || !isFilterGroup(child)) return
    const defaultField = fields[0]
    const defaultType = defaultField?.type ?? "text"
    const defaultOperator = (operatorsByFieldType[defaultType] ?? [])[0] ?? "is"
    const updated: FilterGroup = {
      ...child,
      conditions: [
        ...child.conditions,
        {
          id: uid(),
          fieldKey: defaultField?.key ?? "name",
          operator: defaultOperator,
          value: undefined,
        },
      ],
    }
    handleGroupUpdate(groupIndex, updated)
  }

  const handleLogicToggle = (logic: "and" | "or") => {
    onUpdate({ ...group, logic })
  }

  return (
    <div className="group/grp relative rounded-lg border border-dashed border-border/70 bg-muted/20 p-2.5">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all z-10 opacity-0 scale-90 group-hover/grp:opacity-100 group-hover/grp:scale-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Group
        </span>
        <button
          type="button"
          onClick={onAddCondition}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
          add filter
        </button>
      </div>

      {group.conditions.map((item, index) => (
        <div key={item.id}>
          {index > 0 && <LogicConnector logic={group.logic} onLogicChange={handleLogicToggle} />}
          {isFilterGroup(item) ? (
            <FilterGroupBlock
              group={item}
              fields={fields}
              operatorsByFieldType={operatorsByFieldType}
              onUpdate={(updated) => handleGroupUpdate(index, updated)}
              onRemove={() => handleRemoveItem(index)}
              onAddCondition={() => handleAddNestedCondition(index)}
              depth={depth + 1}
            />
          ) : (
            <FilterConditionCard
              condition={item}
              fields={fields}
              operatorsByFieldType={operatorsByFieldType}
              onUpdate={(updated) => handleConditionUpdate(index, updated)}
              onRemove={() => handleRemoveItem(index)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main FilterPanel ─────────────────────────────────────────────

export function FilterPanel({
  filters,
  onFiltersChange,
  fields,
  operatorsByFieldType,
}: FilterPanelProps) {
  const hasConditions = filters && filters.conditions.length > 0
  const activeCount = filters ? countConditions(filters) : 0

  // ─── Mutation helpers ─────────────────────────────────────

  const getOrCreateFilters = (): FilterConfig => {
    return (
      filters ?? {
        id: uid(),
        logic: "and",
        conditions: [],
      }
    )
  }

  const makeDefaultCondition = (): FilterCondition => {
    const defaultField = fields[0]
    const defaultType = defaultField?.type ?? "text"
    const defaultOperator = (operatorsByFieldType[defaultType] ?? [])[0] ?? "is"
    return {
      id: uid(),
      fieldKey: defaultField?.key ?? "name",
      operator: defaultOperator,
      value: undefined,
    }
  }

  const handleAddFilter = () => {
    const current = getOrCreateFilters()
    onFiltersChange({
      ...current,
      conditions: [...current.conditions, makeDefaultCondition()],
    })
  }

  const handleAddGroupedFilter = () => {
    const current = getOrCreateFilters()
    const newGroup: FilterGroup = {
      id: uid(),
      logic: "and",
      conditions: [makeDefaultCondition()],
    }
    onFiltersChange({
      ...current,
      conditions: [...current.conditions, newGroup],
    })
  }

  const handleAddConditionToGroup = (groupIndex: number) => {
    if (!filters) return
    const group = filters.conditions[groupIndex]
    if (!group || !isFilterGroup(group)) return
    const updatedGroup: FilterGroup = {
      ...group,
      conditions: [...group.conditions, makeDefaultCondition()],
    }
    const newConditions = [...filters.conditions]
    newConditions[groupIndex] = updatedGroup
    onFiltersChange({ ...filters, conditions: newConditions })
  }

  const handleUpdateItem = (index: number, updated: FilterCondition | FilterGroup) => {
    if (!filters) return
    const newConditions = [...filters.conditions]
    newConditions[index] = updated
    onFiltersChange({ ...filters, conditions: newConditions })
  }

  const handleRemoveItem = (index: number) => {
    if (!filters) return
    const newConditions = filters.conditions.filter((_, i) => i !== index)
    if (newConditions.length === 0) {
      onFiltersChange(undefined)
    } else {
      onFiltersChange({ ...filters, conditions: newConditions })
    }
  }

  const handleLogicToggle = (logic: "and" | "or") => {
    if (!filters) return
    onFiltersChange({ ...filters, logic })
  }

  const handleClearAll = () => {
    onFiltersChange(undefined)
  }

  return (
    <div>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
            {activeCount}
          </span>
        )}
        <span title="Add filters to narrow down your results. Combine conditions with AND/OR logic.">
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </span>
      </div>

      {/* Filter workspace */}
      <div className="px-4 py-4 min-h-[120px] max-h-[400px] overflow-y-auto">
        {!hasConditions ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No filters applied. Add a filter to narrow down your results.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filters!.conditions.map((item, index) => (
              <div key={item.id}>
                {index > 0 && (
                  <LogicConnector
                    logic={filters!.logic}
                    onLogicChange={handleLogicToggle}
                  />
                )}
                {isFilterGroup(item) ? (
                  <FilterGroupBlock
                    group={item}
                    fields={fields}
                    operatorsByFieldType={operatorsByFieldType}
                    onUpdate={(updated) => handleUpdateItem(index, updated)}
                    onRemove={() => handleRemoveItem(index)}
                    onAddCondition={() => handleAddConditionToGroup(index)}
                    depth={2}
                  />
                ) : (
                  <FilterConditionCard
                    condition={item}
                    fields={fields}
                    operatorsByFieldType={operatorsByFieldType}
                    onUpdate={(updated) => handleUpdateItem(index, updated)}
                    onRemove={() => handleRemoveItem(index)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleAddFilter}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Add filter
          </button>
          <button
            type="button"
            onClick={handleAddGroupedFilter}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap shrink-0"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            Add group
          </button>
        </div>
        {hasConditions && (
          <button
            type="button"
            onClick={handleClearAll}
            title="Clear all filters"
            aria-label="Clear all filters"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-colors shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
