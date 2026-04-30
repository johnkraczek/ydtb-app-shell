# Replit Handoff Constraints

## Allowed design surface
Replit should work only inside:
- dashboard chrome
- icon rail
- sidebar portal region
- header portal region
- main content area
- cmd-k / search-provider surface

## Do not redesign
- overall app shell architecture
- scope/workspace chrome outside the provided regions
- product mental model (filesystem / business file OS)
- information architecture that depends on tree + breadcrumbs + inspector working together

## Optimize for
- familiarity / "I already know how to use this"
- native filesystem feel
- strong place-awareness
- dense but calm information design
- premium business software feel
- obvious selection and drag/drop affordances

## Avoid
- generic SaaS CRUD look
- card soup replacing hierarchy
- flattening the folder/path mental model
- over-wizarding the experience
- hiding core file actions too deeply

## Data rule
- use static JSON fixtures only
- no backend assumptions beyond the fixture shapes
- no live auth / search / upload / storage services
