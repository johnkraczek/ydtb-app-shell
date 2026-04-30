export interface AvatarPickerData {
  icon?: string
  iconType: "image" | "lucide"
  iconColor?: string
  backgroundColor?: string
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface IconOption {
  name: string
  icon: React.ComponentType<{ className?: string }>
}

export interface ColorOption {
  name: string
  value: string
}
