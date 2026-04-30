/**
 * IconPicker — Dialog-wrapped icon picker.
 *
 * Thin wrapper around IconPickerForm; if you're inside another surface
 * (drawer, Cmd+K panel subview, side panel) use IconPickerForm directly.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog.tsx"
import type { AvatarPickerData } from "./types.ts"
import { IconPickerForm } from "./IconPickerForm.tsx"

interface IconPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AvatarPickerData
  updateData: (updates: Partial<AvatarPickerData>) => void
}

export function IconPicker({ open, onOpenChange, data, updateData }: IconPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose Icon</DialogTitle>
        </DialogHeader>
        <IconPickerForm
          data={data}
          updateData={updateData}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
