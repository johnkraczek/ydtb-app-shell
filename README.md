# Storage UI Static Package

Self-contained static design package for the YDTB Storage tool.

## Purpose

This project exists so Replit can design the Storage UI **inside YDTB's real shell/tie points** without needing the real backend.

Everything in here is intentionally static:
- no backend calls
- no auth dependency
- no real uploads
- no live search indexing
- no persistence requirements

## Fixed regions

Replit should work inside these fixed regions only:
- dashboard chrome
- icon rail
- sidebar portal region
- header portal region
- main content area
- cmd-k / search-provider surface

## Workspace layout

```text
replit/storage/
  apps/web/                 # static demo app
  packages/contracts/       # shared static UI/data contracts
  packages/ui/              # local UI primitives / future @ydtb/ui comparison point
  docs/mockups/             # source reference screenshots
```

## Scripts

From this folder:

```bash
pnpm install
pnpm dev
pnpm build
```

## Current scaffold scope

This scaffold includes:
- a minimal static dashboard shell
- a storage page renderer driven by JSON scenarios
- starter scenario fixtures based on the uploaded mockups
- local contracts package for expected UI data shapes
- local `@ydtb/ui` package stub for future comparison/copy-forward work

## Important note

This package is a **design sandbox**, not the real app.
It should preserve the shape of the UI contract and shell boundaries, while allowing fast visual iteration.
