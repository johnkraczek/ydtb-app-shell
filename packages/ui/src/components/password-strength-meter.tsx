import { useMemo } from "react"

function getPasswordStrength(password: string, minLength: number) {
  if (!password)
    return {
      score: 0,
      label: "",
      checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
    }

  const checks = {
    length: password.length >= minLength,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const passed = Object.values(checks).filter(Boolean).length
  if (passed <= 1) return { score: 1, label: "Weak", checks }
  if (passed <= 2) return { score: 2, label: "Fair", checks }
  if (passed <= 3) return { score: 3, label: "Good", checks }
  if (passed === 4) return { score: 4, label: "Strong", checks }
  return { score: 5, label: "Excellent", checks }
}

export function PasswordStrengthMeter({
  password,
  minLength = 8,
}: {
  password: string
  minLength?: number
}) {
  const { score, label } = useMemo(
    () => getPasswordStrength(password, minLength),
    [password, minLength],
  )
  if (!password) return null

  const tooShort = password.length < minLength
  const colors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-400",
    "bg-emerald-500",
  ]
  const textColors = [
    "",
    "text-red-500",
    "text-orange-500",
    "text-amber-500",
    "text-emerald-400",
    "text-emerald-500",
  ]
  const barColor = tooShort ? "bg-orange-500" : colors[score]
  const textColor = tooShort ? "text-orange-500" : textColors[score]
  const displayLabel = tooShort ? "Too short" : label

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted/50">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ease-out ${i <= score ? barColor : "bg-muted/50"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium transition-colors duration-300 ${textColor}`}>
          {displayLabel}
        </span>
        <span className="text-xs text-muted-foreground">
          {tooShort
            ? `Minimum ${minLength} characters`
            : score < 4
              ? "Add uppercase, numbers, symbols"
              : "Great password!"}
        </span>
      </div>
    </div>
  )
}
