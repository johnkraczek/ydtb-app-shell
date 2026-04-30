import type { LucideIcon } from "lucide-react"

import { cn } from "../../lib/utils.ts"

interface SettingsSidebarItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
}

interface SettingsSidebarSection {
  id: string
  label: string
  items: SettingsSidebarItem[]
}

interface SettingsSidebarProps {
  sections: SettingsSidebarSection[]
  activeSection: string
  onSectionChange: (id: string) => void
}

function SettingsSidebar({ sections, activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <nav className="flex flex-col gap-4 p-4" aria-label="Settings navigation">
      {sections.map((section) => (
        <div key={section.id}>
          <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.label}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              const Component = item.href ? "a" : "button"
              const linkProps = item.href ? { href: item.href } : {}

              return (
                <li key={item.id}>
                  <Component
                    {...linkProps}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                    )}
                    onClick={() => onSectionChange(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Component>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export { SettingsSidebar }
export type { SettingsSidebarProps, SettingsSidebarSection, SettingsSidebarItem }
