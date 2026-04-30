import * as React from "react"

interface SettingsLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  title: string
  description: string
}

function SettingsLayout({ children, sidebar, title, description }: SettingsLayoutProps) {
  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar - hidden on mobile, fixed width on desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border">
        {sidebar}
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Mobile sidebar - shown above content on small screens */}
          <div className="mb-6 md:hidden">{sidebar}</div>

          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

export { SettingsLayout }
export type { SettingsLayoutProps }
