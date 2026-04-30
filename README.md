# YDTB App Shell — Storage Design Sandbox

This repo exists to give Replit a **real YDTB shell environment** to design inside.

## What this repo is

- a static sandbox
- a copy of the existing shell structure
- a copy of the real `@ydtb/tk-scope-ui` package source
- a place to build inside the same tie points the real app uses

## What this repo is not

- not the real app
- not connected to the backend
- not the place for us to pre-build the Storage UI
- not permissioned to redesign shell architecture

## Fixed shell regions

Replit should work only inside these areas:
- sidebar portal
- header portal
- main content area
- cmd-k / search-provider related surface

The outer shell/chrome should be treated as fixed.

## Important constraint

There should be **no authored Storage UI** in the build regions before handoff.
Those regions should remain blank / neutral so Replit is designing into the shell rather than replacing our own attempt.

## Packages in this repo

- `packages/ui` — copied from the real `tk-scope/packages/ui`
- `packages/core-client` — minimal portal system matching the real shell portal mechanism
- `packages/tk-scope` — minimal client portal exports (`HeaderPortal`, `SidebarPortal`) matching the real toolkit API shape
- `apps/web` — static shell host app

## Run locally

```bash
pnpm install
pnpm dev
pnpm build
```
