import { useState, useRef, useEffect } from "react"
import { CalendarIcon, Check, ExternalLink, Plus } from "lucide-react"
import { Input } from "../input.tsx"
import { Checkbox } from "../checkbox.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "../popover.tsx"
import { cn } from "../../lib/utils.ts"

// --- Exported types ---

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "dropdown"
  | "labels"
  | "checkbox"
  | "money"
  | "website"
  | "formula"

export interface FieldOption {
  value: string
  label: string
  color: string | null
}

// --- Shared OptionList for dropdown/labels ---

function OptionList({
  options,
  selected,
  onSelect,
  onCreateOption,
  multiSelect,
}: {
  options: FieldOption[]
  selected: string | string[]
  onSelect: (value: string) => void
  onCreateOption?: (option: { value: string; label: string }) => void
  multiSelect?: boolean
}) {
  const [search, setSearch] = useState("")

  const filtered = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))

  const exactMatch = options.some((opt) => opt.label.toLowerCase() === search.toLowerCase())

  const isSelected = (value: string) =>
    Array.isArray(selected) ? selected.includes(value) : selected === value

  return (
    <div className="flex flex-col gap-1">
      <Input
        placeholder="Search or add options.."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-7 text-xs"
      />
      <div className="max-h-48 overflow-y-auto mt-1 flex flex-col gap-0.5">
        {!multiSelect && (
          <button
            type="button"
            onClick={() => onSelect("")}
            className="flex w-full items-center justify-center rounded-md py-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted transition-colors"
          >
            -
          </button>
        )}
        {filtered.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className="flex w-full items-center rounded-md text-xs transition-colors overflow-hidden"
          >
            {opt.color ? (
              <span
                className="flex w-full items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: opt.color }}
              >
                {isSelected(opt.value) && <Check className="size-3 mr-1.5 shrink-0" />}
                {opt.label}
              </span>
            ) : (
              <span className="flex w-full items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md">
                <span className="flex size-3.5 items-center justify-center">
                  {isSelected(opt.value) && <Check className="size-3" />}
                </span>
                {opt.label}
              </span>
            )}
          </button>
        ))}
        {search.trim() && !exactMatch && onCreateOption && (
          <button
            type="button"
            onClick={() => {
              onCreateOption({
                value: search.trim().toLowerCase().replace(/\s+/g, "-"),
                label: search.trim(),
              })
              setSearch("")
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-primary hover:bg-muted transition-colors"
          >
            <Plus className="size-3.5" />
            {multiSelect ? `Create tag "${search.trim()}"` : `Create "${search.trim()}"`}
          </button>
        )}
      </div>
    </div>
  )
}

// --- InlineCellEditor Props ---

export interface InlineCellEditorProps {
  field: {
    id: string
    name: string
    type: FieldType
    options?: FieldOption[]
  }
  value: string | null
  onChange: (value: string | null) => void
  onCreateOption?: (option: { value: string; label: string }) => void
  /** Popover alignment for dropdown/labels editors. Defaults to 'start'. */
  align?: "start" | "center" | "end"
}

export function InlineCellEditor({
  field,
  value,
  onChange,
  onCreateOption,
  align,
}: InlineCellEditorProps) {
  switch (field.type) {
    case "text":
      return <InlineTextEditor value={value} onChange={onChange} />
    case "textarea":
      return <InlineTextareaEditor value={value} onChange={onChange} />
    case "number":
      return <InlineNumberEditor value={value} onChange={onChange} />
    case "date":
      return <InlineDateEditor value={value} onChange={onChange} />
    case "dropdown":
      return (
        <InlineDropdownEditor
          field={field}
          value={value}
          onChange={onChange}
          onCreateOption={onCreateOption}
          align={align}
        />
      )
    case "labels":
      return (
        <InlineLabelsEditor
          field={field}
          value={value}
          onChange={onChange}
          onCreateOption={onCreateOption}
          align={align}
        />
      )
    case "checkbox":
      return <InlineCheckboxEditor value={value} onChange={onChange} />
    case "money":
      return <InlineMoneyEditor value={value} onChange={onChange} />
    case "website":
      return <InlineWebsiteEditor value={value} onChange={onChange} />
    case "formula":
      return <span className="text-sm text-muted-foreground truncate">{value || "\u2014"}</span>
    default:
      return null
  }
}

// --- Click-to-edit wrapper ---

function ClickToEdit({
  displayContent,
  children,
  onBlur,
}: {
  displayContent: React.ReactNode
  children: (props: { onDone: () => void }) => React.ReactNode
  onBlur: () => void
}) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <div
        className="w-full min-h-[28px] flex items-center cursor-pointer text-sm truncate px-1 rounded hover:bg-muted/50 transition-colors"
        onClick={() => setEditing(true)}
      >
        {displayContent}
      </div>
    )
  }

  return (
    <div
      onBlur={(e) => {
        // Only close if focus leaves the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setEditing(false)
          onBlur()
        }
      }}
    >
      {children({ onDone: () => setEditing(false) })}
    </div>
  )
}

// --- Type-specific inline sub-components ---

function InlineTextEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [local, setLocal] = useState(value ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocal(value ?? "")
  }, [value])

  const commit = () => {
    const trimmed = local.trim()
    onChange(trimmed || null)
  }

  return (
    <ClickToEdit
      displayContent={
        <span className={cn(!value && "text-muted-foreground")}>{value || "\u2014"}</span>
      }
      onBlur={commit}
    >
      {({ onDone }) => (
        <Input
          ref={inputRef}
          autoFocus
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            commit()
            onDone()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
              onDone()
            }
            if (e.key === "Escape") {
              setLocal(value ?? "")
              onDone()
            }
          }}
          className="h-7 text-sm"
        />
      )}
    </ClickToEdit>
  )
}

function InlineTextareaEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [local, setLocal] = useState(value ?? "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocal(value ?? "")
  }, [value])

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }, [local])

  const commit = () => {
    const trimmed = local.trim()
    onChange(trimmed || null)
  }

  const displayText = value ? (value.length > 50 ? value.slice(0, 50) + "..." : value) : null

  return (
    <ClickToEdit
      displayContent={
        <span className={cn(!value && "text-muted-foreground")}>{displayText || "\u2014"}</span>
      }
      onBlur={commit}
    >
      {({ onDone }) => (
        <textarea
          ref={textareaRef}
          autoFocus
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            commit()
            onDone()
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setLocal(value ?? "")
              onDone()
            }
          }}
          rows={2}
          className={cn(
            "placeholder:text-muted-foreground border-input flex w-full rounded-md border bg-transparent px-2 py-1 text-sm shadow-xs outline-none resize-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          )}
        />
      )}
    </ClickToEdit>
  )
}

function InlineNumberEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [local, setLocal] = useState(value ?? "")

  useEffect(() => {
    setLocal(value ?? "")
  }, [value])

  const commit = () => {
    const trimmed = local.trim()
    onChange(trimmed || null)
  }

  return (
    <ClickToEdit
      displayContent={
        <span className={cn(!value && "text-muted-foreground")}>{value || "\u2014"}</span>
      }
      onBlur={commit}
    >
      {({ onDone }) => (
        <Input
          autoFocus
          type="number"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            commit()
            onDone()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
              onDone()
            }
            if (e.key === "Escape") {
              setLocal(value ?? "")
              onDone()
            }
          }}
          className="h-7 text-sm"
        />
      )}
    </ClickToEdit>
  )
}

function InlineDateEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  const dateValue = value ? new Date(value) : null
  const displayValue = dateValue ? dateValue.toLocaleDateString() : null

  // Convert ISO to YYYY-MM-DD for the native input
  const inputValue = dateValue ? dateValue.toISOString().split("T")[0] : ""

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    if (dateStr) {
      const date = new Date(dateStr + "T00:00:00")
      onChange(date.toISOString())
    } else {
      onChange(null)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 w-full min-h-[28px] px-1 rounded text-sm hover:bg-muted/50 transition-colors truncate",
            !displayValue && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
          {displayValue || "\u2014"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <input
          type="date"
          value={inputValue}
          onChange={handleDateChange}
          className={cn(
            "border-input flex h-8 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Clear date
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

function InlineDropdownEditor({
  field,
  value,
  onChange,
  onCreateOption,
  align = "start",
}: {
  field: { options?: FieldOption[] }
  value: string | null
  onChange: (value: string | null) => void
  onCreateOption?: (option: { value: string; label: string }) => void
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const options = field.options ?? []
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center w-full min-h-[28px] px-1 rounded text-sm hover:bg-muted/50 transition-colors truncate"
        >
          {selectedOption ? (
            selectedOption.color ? (
              <span
                className="flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-white truncate"
                style={{ backgroundColor: selectedOption.color }}
              >
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-sm">{selectedOption.label}</span>
            )
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2 overflow-y-auto"
        align={align}
        collisionPadding={16}
        avoidCollisions
        style={{ maxHeight: "var(--radix-popover-content-available-height, 300px)" }}
      >
        <OptionList
          options={options}
          selected={value ?? ""}
          onSelect={(val) => {
            onChange(val || null)
            setOpen(false)
          }}
          onCreateOption={onCreateOption}
        />
      </PopoverContent>
    </Popover>
  )
}

function InlineLabelsEditor({
  field,
  value,
  onChange,
  onCreateOption,
  align = "start",
}: {
  field: { options?: FieldOption[] }
  value: string | null
  onChange: (value: string | null) => void
  onCreateOption?: (option: { value: string; label: string }) => void
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const options = field.options ?? []

  let selectedValues: string[] = []
  try {
    selectedValues = value ? JSON.parse(value) : []
  } catch {
    selectedValues = []
  }

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value))

  const handleToggle = (val: string) => {
    const next = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val]
    onChange(next.length > 0 ? JSON.stringify(next) : null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 w-full min-h-[28px] px-1 rounded hover:bg-muted/50 transition-colors overflow-hidden"
        >
          {selectedOptions.length > 0 ? (
            <span className="flex items-center gap-1 overflow-hidden">
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-white shrink-0"
                  style={{
                    backgroundColor: opt.color || undefined,
                  }}
                >
                  {opt.label}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2 overflow-y-auto"
        align={align}
        collisionPadding={16}
        avoidCollisions
        style={{ maxHeight: "var(--radix-popover-content-available-height, 300px)" }}
      >
        <OptionList
          options={options}
          selected={selectedValues}
          onSelect={handleToggle}
          onCreateOption={onCreateOption}
          multiSelect
        />
      </PopoverContent>
    </Popover>
  )
}

function InlineCheckboxEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const checked = value === "true"

  return (
    <div className="flex items-center justify-center w-full min-h-[28px]">
      <Checkbox
        checked={checked}
        onCheckedChange={(state) => {
          onChange(state === true ? "true" : "false")
        }}
      />
    </div>
  )
}

function InlineMoneyEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [local, setLocal] = useState(value ?? "")

  useEffect(() => {
    setLocal(value ?? "")
  }, [value])

  const commit = () => {
    const trimmed = local.trim()
    onChange(trimmed || null)
  }

  const displayValue = value ? `$${parseFloat(value).toFixed(2)}` : null

  return (
    <ClickToEdit
      displayContent={
        <span className={cn(!value && "text-muted-foreground")}>{displayValue || "\u2014"}</span>
      }
      onBlur={commit}
    >
      {({ onDone }) => (
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            $
          </span>
          <Input
            autoFocus
            type="number"
            step="0.01"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => {
              commit()
              onDone()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commit()
                onDone()
              }
              if (e.key === "Escape") {
                setLocal(value ?? "")
                onDone()
              }
            }}
            className="h-7 text-sm pl-5"
          />
        </div>
      )}
    </ClickToEdit>
  )
}

function InlineWebsiteEditor({
  value,
  onChange,
}: {
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [local, setLocal] = useState(value ?? "")

  useEffect(() => {
    setLocal(value ?? "")
  }, [value])

  const commit = () => {
    const trimmed = local.trim()
    onChange(trimmed || null)
  }

  return (
    <ClickToEdit
      displayContent={
        value ? (
          <span className="flex items-center gap-1 text-sm text-primary truncate">
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate">{value}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{"\u2014"}</span>
        )
      }
      onBlur={commit}
    >
      {({ onDone }) => (
        <Input
          autoFocus
          type="url"
          placeholder="https://"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            commit()
            onDone()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
              onDone()
            }
            if (e.key === "Escape") {
              setLocal(value ?? "")
              onDone()
            }
          }}
          className="h-7 text-sm"
        />
      )}
    </ClickToEdit>
  )
}
