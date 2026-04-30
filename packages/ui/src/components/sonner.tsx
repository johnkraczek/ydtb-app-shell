import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-background)",
          "--normal-text": "var(--color-foreground)",
          "--normal-border": "var(--color-border)",
          "--success-bg": "var(--color-background)",
          "--success-text": "var(--color-foreground)",
          "--success-border": "var(--color-border)",
          "--error-bg": "var(--color-background)",
          "--error-text": "var(--color-destructive)",
          "--error-border": "var(--color-border)",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
