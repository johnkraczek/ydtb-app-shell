import { PortalProvider, PortalSlot } from "@ydtb/core-client"
import { Button } from "@ydtb/tk-scope-ui/components/button"
import { Input } from "@ydtb/tk-scope-ui/components/input"
import shell from "./fixtures/shell.json"
import {
  HardDrive,
  House,
  Rocket,
  Search,
  Settings2,
  Users,
  Zap,
} from "lucide-react"

const iconMap = {
  HardDrive,
  House,
  Rocket,
  Search,
  Settings2,
  Users,
  Zap,
} as const

function resolveIcon(name: keyof typeof iconMap) {
  return iconMap[name] ?? HardDrive
}

type RailItem = {
  id: string
  label: string
  icon: keyof typeof iconMap
  active?: boolean
}

export default function App() {
  return (
    <PortalProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-xl font-semibold tracking-tight">{shell.productName}</div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {shell.workspace.shortName}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{shell.workspace.name}</div>
                  <div className="text-xs text-muted-foreground">{shell.workspace.plan}</div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[420px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={shell.globalSearchPlaceholder} readOnly />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">Static shell package</div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden p-2 gap-2">
          <nav className="hidden w-[60px] shrink-0 rounded-xl bg-card py-3 lg:flex lg:flex-col lg:items-center lg:gap-0.5">
            {(shell.rail.top as RailItem[]).map((item) => {
              const Icon = resolveIcon(item.icon as keyof typeof iconMap)
              return (
                <Button
                  key={item.id}
                  variant={item.active ? "default" : "ghost"}
                  size="icon"
                  className={item.active ? "shadow-md" : "text-muted-foreground"}
                  type="button"
                >
                  <Icon className="h-[20px] w-[20px]" strokeWidth={item.active ? 2 : 1.5} />
                  <span className="sr-only">{item.label}</span>
                </Button>
              )
            })}

            <div className="flex-1" />

            {(shell.rail.bottom as RailItem[]).map((item) => {
              const Icon = resolveIcon(item.icon as keyof typeof iconMap)
              return (
                <Button
                  key={item.id}
                  variant={item.active ? "default" : "ghost"}
                  size="icon"
                  className={item.active ? "shadow-md" : "text-muted-foreground"}
                  type="button"
                >
                  <Icon className="h-[20px] w-[20px]" strokeWidth={item.active ? 2 : 1.5} />
                  <span className="sr-only">{item.label}</span>
                </Button>
              )
            })}
          </nav>

          <div className="flex flex-1 overflow-hidden gap-2">
            <aside className="hidden w-[260px] shrink-0 overflow-hidden rounded-xl bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold tracking-tight">Tools</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <PortalSlot name="sidebar" className="flex min-h-full flex-col" />
              </div>
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-card text-card-foreground">
              <div className="border-b border-border px-6 py-4">
                <PortalSlot name="header" className="flex min-h-[32px] items-center" />
              </div>

              <main className="flex-1 overflow-auto bg-background/40" />
            </div>
          </div>
        </div>
      </div>
    </PortalProvider>
  )
}
