/**
 * IconPickerForm — the picker UI without a Dialog wrapper.
 *
 * Renders the icon grid + upload area + crop flow as plain content, so
 * callers can host it inside any container (Dialog, drawer, Cmd+K
 * panel subview, etc.). `IconPicker` is the Dialog-wrapped variant.
 */
import { useState, useCallback, useRef } from "react"
import Cropper from "react-easy-crop"
import { Button } from "../button.tsx"
import { Input } from "../input.tsx"
import { Label } from "../label.tsx"
import { ScrollArea } from "../scroll-area.tsx"
import { Slider } from "../slider.tsx"
import { Search, Upload, LayoutDashboard } from "lucide-react"
import { cn } from "../../lib/utils.ts"
import type { AvatarPickerData, CropArea } from "./types.ts"
import { ICON_LIST, COLORS } from "./constants.ts"
import { getCroppedImg, getColorStyle } from "./utils.ts"
import { AvatarPreview } from "./AvatarPreview.tsx"

export interface IconPickerFormProps {
  data: AvatarPickerData
  updateData: (updates: Partial<AvatarPickerData>) => void
  /** Called when the user finishes (Done or Save Crop). Hosts use it to dismiss the surface. */
  onDone?: () => void
}

export function IconPickerForm({ data, updateData, onDone }: IconPickerFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [iconSearch, setIconSearch] = useState("")

  const filteredIcons = ICON_LIST.filter((i) =>
    i.name.toLowerCase().includes(iconSearch.toLowerCase()),
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageSrc(reader.result as string)
        setIsCropping(true)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const onCropComplete = useCallback((_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSaveCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
        updateData({ icon: croppedImage, iconType: "image" })
        setIsCropping(false)
        onDone?.()
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleCancelCrop = () => {
    setIsCropping(false)
    setImageSrc(null)
  }

  const handleIconSelect = (iconName: string) => {
    setImageSrc(null)
    setCroppedAreaPixels(null)
    updateData({ icon: iconName, iconType: "lucide" })
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 py-4 min-h-[400px]">
      {/* Left: Icon Grid or Back Button */}
      <div
        className={cn(
          "flex flex-col gap-4 transition-all duration-300",
          isCropping ? "w-full md:w-1/3" : "flex-1",
        )}
      >
        {!isCropping && (
          <div className="flex items-start gap-6 p-3 mb-2 rounded-lg border border-border bg-muted/30">
            <div className="flex flex-col items-center justify-center">
              <div className="h-20 w-20 border-2 border-background shadow-sm rounded-full overflow-hidden bg-background flex items-center justify-center">
                <AvatarPreview data={data} size="xl" />
              </div>
            </div>

            <div className="flex-1 pt-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Icon Color
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateData({ iconColor: c.value })}
                    style={{ backgroundColor: getColorStyle(c.value).hex }}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all border border-border",
                      data.iconColor === c.value
                        ? "ring-2 ring-offset-2 ring-muted-foreground scale-110"
                        : "hover:scale-110 opacity-90 hover:opacity-100",
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Choose Icon
        </div>

        {isCropping ? (
          <div
            className="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-muted/30 transition-colors cursor-pointer p-6 text-center"
            onClick={handleCancelCrop}
          >
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">Choose Icon</p>
              <p className="text-xs text-muted-foreground mt-1">Select from library</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[220px] border border-border rounded-lg p-4">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {filteredIcons.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleIconSelect(item.name)}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border-2 hover:bg-muted/50 transition-all aspect-square",
                      data.iconType === "lucide" && data.icon === item.name
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground",
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </button>
                ))}
                {filteredIcons.length === 0 && (
                  <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                    No icons found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden md:flex flex-col items-center justify-center">
        <div className="w-px h-full bg-border relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background py-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
            OR
          </div>
        </div>
      </div>

      {/* Right: Upload Option OR Cropper */}
      <div
        className={cn(
          "flex flex-col gap-4 transition-all duration-300",
          isCropping ? "w-full md:w-2/3" : "w-full md:w-1/3",
        )}
      >
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {isCropping ? "Adjust Image" : "Upload Image"}
        </div>

        {isCropping ? (
          <div className="flex-1 flex flex-col gap-4 items-center justify-center">
            <div className="relative w-[260px] h-[260px] bg-muted rounded-lg overflow-hidden shrink-0 shadow-inner border border-border">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                  cropSize={{ width: 220, height: 220 }}
                />
              )}
            </div>
            <div className="flex items-center gap-4 w-full max-w-[260px]">
              <span className="text-sm font-medium">Zoom</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0] ?? 1)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="ghost" onClick={handleCancelCrop}>
                Cancel
              </Button>
              <Button onClick={handleSaveCrop}>Save Icon</Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <button
              type="button"
              className="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-muted/30 transition-colors cursor-pointer p-6 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-foreground">Upload Photo</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF up to 5MB</p>
              </div>
            </button>

            <Button size="lg" className="w-full" onClick={() => onDone?.()}>
              Done
            </Button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="sr-only"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  )
}
