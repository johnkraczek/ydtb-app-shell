import type { CropArea } from "./types.ts"

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

export async function getCroppedImg(imageSrc: string, pixelCrop: CropArea): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return ""

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  // Return base64 data URL for persistent storage (not a temporary blob URL)
  return canvas.toDataURL("image/jpeg", 0.8)
}

export interface ColorStyle {
  hex: string
  softHex: string
}

const COLOR_MAP: Record<string, ColorStyle> = {
  slate: { hex: "#475569", softHex: "#f1f5f9" },
  red: { hex: "#dc2626", softHex: "#fee2e2" },
  orange: { hex: "#ea580c", softHex: "#ffedd5" },
  amber: { hex: "#d97706", softHex: "#fef3c7" },
  green: { hex: "#16a34a", softHex: "#dcfce7" },
  teal: { hex: "#0d9488", softHex: "#ccfbf1" },
  blue: { hex: "#2563eb", softHex: "#dbeafe" },
  indigo: { hex: "#4f46e5", softHex: "#e0e7ff" },
  violet: { hex: "#7c3aed", softHex: "#ede9fe" },
  pink: { hex: "#db2777", softHex: "#fce7f3" },
}

const DEFAULT_COLOR = COLOR_MAP.indigo!

export function getColorStyle(color: string): ColorStyle {
  return COLOR_MAP[color] ?? DEFAULT_COLOR
}

/**
 * @deprecated Use getColorStyle() for inline styles instead of Tailwind classes.
 */
export const getColorClasses = (_color: string): { bg: string; text: string; softBg: string } => {
  return { bg: "", text: "", softBg: "" }
}
