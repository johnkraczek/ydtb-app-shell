# Replit Handoff Constraints

## Core rule
This repo is for Replit to design **inside the existing YDTB shell**, not to reinvent the shell.

## Replit may design inside
- sidebar portal region
- header portal region
- main content area
- cmd-k / search-provider related UI surface

## Replit may not redesign
- the outer dashboard chrome
- the icon rail architecture
- the shell layout contract
- the portal/tie-point model
- the product mental model (filesystem / business OS)

## Important implementation rule
- use the copied `@ydtb/tk-scope-ui` package source already present in this repo
- do not replace it with a separate ad hoc UI system
- keep work static unless explicitly asked otherwise

## Product feel to preserve
- familiar filesystem feel
- clear hierarchy and place-awareness
- premium business software tone
- no generic SaaS CRUD redesign

## Avoid
- card soup
- flattening the file/path/tree model
- wizard-heavy interaction design
- redesigning outside the allowed shell regions
