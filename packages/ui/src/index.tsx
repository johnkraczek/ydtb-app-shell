import type { PropsWithChildren, ReactNode } from "react"

export function ShellCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={["ui-card", className].filter(Boolean).join(" ")}>{children}</section>
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <h3 className="ui-section-title">{children}</h3>
}

export function ShellButton({
  children,
  tone = "secondary",
  icon,
}: PropsWithChildren<{ tone?: "primary" | "secondary" | "ghost" | "danger"; icon?: ReactNode }>) {
  return (
    <button className={["ui-button", `ui-button--${tone}`].join(" ")} type="button">
      {icon ? <span className="ui-button__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}

export function ShellPill({ children, active = false }: PropsWithChildren<{ active?: boolean }>) {
  return <span className={["ui-pill", active ? "ui-pill--active" : ""].join(" ")}>{children}</span>
}

export function EmptyMessage({ title, body }: { title: string; body?: string }) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__icon">◫</div>
      <div className="ui-empty__title">{title}</div>
      {body ? <div className="ui-empty__body">{body}</div> : null}
    </div>
  )
}
