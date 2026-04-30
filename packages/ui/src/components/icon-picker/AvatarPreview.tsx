import { Building2 } from "lucide-react"
import { cn } from "../../lib/utils.ts"
import type { AvatarPickerData } from "./types.ts"
import { ICON_LIST } from "./constants.ts"
import { getColorStyle } from "./utils.ts"

interface AvatarPreviewProps {
  data: AvatarPickerData
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
}

export function AvatarPreview({ data, size = "md", className }: AvatarPreviewProps) {
  if (data.iconType === "image" && data.icon) {
    return (
      <div className={cn("rounded-full overflow-hidden shrink-0", sizeClasses[size], className)}>
        <img src={data.icon} alt="Avatar" className="h-full w-full object-cover" />
      </div>
    )
  }

  const IconComponent = ICON_LIST.find((i) => i.name === data.icon)?.icon ?? Building2
  const iconColor = getColorStyle(data.iconColor ?? "indigo")

  return (
    <div
      style={{ color: iconColor.hex }}
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 bg-primary/15",
        sizeClasses[size],
        className,
      )}
    >
      <IconComponent className={iconSizeClasses[size]} />
    </div>
  )
}
