# @ydtb/tk-scope-ui

## 0.14.7

### Patch Changes

- Updated dependencies [7f366f3]
  - @ydtb/tk-scope@0.13.2

## 0.14.6

### Patch Changes

- Export `IconPickerForm` from the icon-picker barrel.

  This export was added in commit 692bad1 (Apr 25, "feat(cmdk): panel navigation
  stack + Profile avatar picker as subview") alongside `usePanelStack` and
  `CommandPanelSubview`, but the changeset for the tk-scope-ui slice of that
  work was missed. Today's linked-group bump to 0.14.5 published tk-scope-app
  with an `import { IconPickerForm } from "@ydtb/tk-scope-ui/components/icon-picker"`
  against tk-scope-ui@0.13.1, which doesn't export it — breaking downstream
  deployments builds. Catching up the missed publish.

## 0.13.1

### Patch Changes

- Phase 3 cleanup: peel `@typescript-eslint/no-explicit-any` suppressions to zero in tk-scope.

  Most cross-package contract changes are documentation-level (eslint-disable comments now have specific library-boundary rationale instead of generic "Phase 3 cleanup" placeholder). The substantive changes are:
  - `members/list.ts` (in scope-extension, but that's `@ydtb/tk-scope-extension`): removed two row-parameter type annotations that were discarding drizzle's inferred select shape, so consumers of `membersApi.list` now see proper `{ id, userId, name, email, avatar, tier, createdAt, roles }` instead of `{ roles, createdAt, id }`.
  - `LayoutEntry.component` and `ComponentEntry.component` in `@ydtb/tk-scope/client` documented as `ComponentType<any>` for a heterogeneous component registry.

  Consumers should re-run `pnpm install` after upgrading to pull the new types.

- Updated dependencies
  - @ydtb/tk-scope@0.13.1

## 0.12.0

### Minor Changes

- Added `credentialRefreshCoordinator` layer — replaces the module-level `inflight` Map in `lib/credential-refresh.ts` (`#164`).

  The in-flight refresh dedup Map was genuinely shared process-scope state (concurrent refreshes of the same credential row must share one promise to avoid racing the provider's token endpoint). Migrating it to a layer makes the shared state explicit, test-isolable via `withLayers`, and impossible to splinter across pnpm peer-context duplication.

  **New export:** `@ydtb/tk-scope-tool-integrations/layers/credential-refresh-coordinator`

  **Consumer apps:** register `credentialRefreshCoordinator: credentialRefreshCoordinatorLayer()` in the `layers` block of `compose.config.ts` / `app.config.ts`.

  Removed `_clearInflightRefreshes` test helper — tests now reset state by constructing a fresh coordinator in the test's `layers` option via `createTestLayerContext`.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.12.0

## 0.11.0

### Minor Changes

- **BREAKING** state-ownership cleanups (`#164` phase 5):
  - **`@ydtb/core-hooks`** — removed top-level `setHookErrorHandler()`. The error handler is now an optional constructor option: `new HookSystem({ errorHandler })`. Each HookSystem instance owns its handler (proper dependency injection, no shared module-level binding). Caller migration: `new HookSystem(); setHookErrorHandler(fn)` → `new HookSystem({ errorHandler: fn })`.
  - **`@ydtb/tk-scope-integrations`** — removed three top-level exports whose implementations depended on dead in-memory stub stores: `refreshAccessToken`, `getIntegrationCredentials`, `disconnectProvider`. Production flows never used them (they hit the test-scope-IDed stub). Real credential flows live in `credentials-db.ts` + `tools/tool-integrations/lib/credential-refresh.ts`. `IntegrationNotConnected` error class preserved for callers that reference the exception type.

  Collateral: `integration-list.ts` functions reshaped — now return `status: 'not_connected'` defaults for every provider; consumers (the tool-integrations router) overlay real connection state from DB queries. Two deleted test files (`credentials.test.ts`, `list-status-api.test.ts`) exercised only the removed stub behavior.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (2/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.11.0

## 0.10.0

### Minor Changes

- **BREAKING — three small module-state removals (`#164` phase 4a).**
  - **`@ydtb/tk-scope-search`**: removed `registerSearchProviders()` from the public API. The `search:providers` hook filter is now evaluated on-demand inside `getSearchProviders()` instead of being cached in module state. No caller action needed unless you imported `registerSearchProviders` directly.
  - **`@ydtb/tk-scope-onboarding`**: removed `registerOnboardingSteps()` (package-level) from the public API. Same reason — the `onboarding:steps` hook filter is evaluated on-demand inside `getOnboardingSteps()`. No caller action needed unless you imported `registerOnboardingSteps` from `@ydtb/tk-scope-onboarding` directly.
  - **`@ydtb/tk-scope-db`**: the legacy `db` / `connection` exports now pass-through to `getLayer('database').db` / `.sql` from `@ydtb/core-server` (and added `@ydtb/core-server` as a direct dependency). Callers requiring a booted server context still work unchanged; scripts that ran `closeDatabase()` get a no-op (layer lifecycle handles connection closure via Effect.acquireRelease).

  All three replacements eliminate module-state singletons (`const steps`, `const providers`, `let _connection`, `let _db`) that splintered across pnpm peer-context copies. Migration doubled down on the canonical pattern — state lives in layers or hook-filter evaluations, never in mutable module bindings.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 40 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (3/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.10.0

## 0.9.0

### Minor Changes

- **BREAKING (`@ydtb/tk-scope-integrations`)**: replaced the `provider-registry.ts` module singleton with a proper `integrationProviders` layer.

  Phase 3 of the state-ownership migration (`#164`). Suspected fix for `#156` (Meta OAuth at child scope silently fails to persist) — the `providers` Map in the deleted module was the prime candidate for splintering across pnpm peer-context copies.

  **Removed:**
  - `@ydtb/tk-scope-integrations` top-level exports `registerProvider`, `getProvider`, `getAllProviders` (plus the whole `services/provider-registry.ts` module).

  **Added:**
  - `@ydtb/tk-scope-integrations/layers/integration-providers` — new export with `IntegrationProvidersLayer` interface + `integrationProvidersLayer(providers)` factory. Methods: `getProvider`, `getAllProviders`. Augments `LayerMap` with `integrationProviders`.

  **Consumer migration:**

  ```ts
  // compose.config.ts — before (imperative)
  import { registerProvider } from "@ydtb/tk-scope-integrations"
  import { metaProvider } from "@ydtb/core-integration-meta"
  import { googleProvider } from "@ydtb/tk-scope-integrations-google"

  registerProvider(metaProvider)
  registerProvider(googleProvider)

  // compose.config.ts — after (declarative)
  import { integrationProvidersLayer } from "@ydtb/tk-scope-integrations/layers/integration-providers"
  import { metaProvider } from "@ydtb/core-integration-meta"
  import { googleProvider } from "@ydtb/tk-scope-integrations-google"

  defineApp({
    layers: {
      integrationProviders: integrationProvidersLayer([metaProvider, googleProvider]),
      // ...
    },
  })
  ```

  ```ts
  // Consumer code — before
  import { getProvider } from "@ydtb/tk-scope-integrations"
  const provider = getProvider("meta")

  // Consumer code — after
  import { getLayer } from "@ydtb/core-server"
  import "@ydtb/tk-scope-integrations/layers/integration-providers"
  const provider = getLayer("integrationProviders").getProvider("meta")
  ```

  Runtime mutation (calling `registerProvider` after boot) is explicitly unsupported — it would re-introduce the bug this migration fixed. Providers are frozen at layer acquire-time.

  `@ydtb/tk-scope-tool-integrations` is patched: its internal consumers (`server.ts`, `api/router.ts`, `lib/credential-refresh.ts`) migrated to the layer API. No breaking surface change for tool-integrations consumers.

  See `anvil/docs/STATE_OWNERSHIP.md` for the rule and `#164` for the full migration epic.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (2/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.9.0

## 0.8.0

### Minor Changes

- **BREAKING (`@ydtb/tk-scope-platform`)**: replaced `scope-utils.ts` module-state singleton with a proper `scopeHierarchy` layer.

  Phase 2 of the state-ownership migration (`#164`). Fixes the 2026-04-22 OAuth redirect regression — post-OAuth users were landing on the dashboard instead of the scoped integrations drawer because the `_hierarchy` singleton in `scope-utils.ts` splintered across pnpm peer-context duplicates (one copy initialized by `initScopeHierarchy`, sibling packages reading from a different null-valued copy, `try/catch` swallowed the error, fallback URL fired).

  **Removed:**
  - `@ydtb/tk-scope-platform/lib/scope-utils` — the entire module, including `initScopeHierarchy()`, `getScopeConfigByType()`, `getChildScopeTypes()`, `getScopeLabels()`.

  **Added:**
  - `@ydtb/tk-scope-platform/layers/scope-hierarchy` — new export with `ScopeHierarchyLayer` interface + `scopeHierarchyLayer(tree)` factory. Methods: `getConfigByType`, `getChildScopeTypes`, `getLabels`. Augments `LayerMap` with `scopeHierarchy`.

  **Consumer migration:**

  ```ts
  // compose.config.ts — before
  // (no layer registration; initScopeHierarchy called at server entry)

  // compose.config.ts — after
  import { scopeHierarchyLayer } from "@ydtb/tk-scope-platform/layers/scope-hierarchy"
  import { scopeTree } from "./scope-tree"

  defineApp({
    layers: {
      scopeHierarchy: scopeHierarchyLayer(scopeTree),
      // ...
    },
  })
  ```

  ```ts
  // server/worker.ts — before
  import { initScopeHierarchy } from "@ydtb/tk-scope-platform/lib/scope-utils"
  initScopeHierarchy(scopeTree)

  // after
  // (the top-level initScopeHierarchy call is removed entirely — the layer
  // factory handles it at acquire-time from compose.config.ts)
  ```

  ```ts
  // Any consumer that called the old scope-utils API — before
  import { getScopeConfigByType } from "@ydtb/tk-scope-platform/lib/scope-utils"
  const cfg = getScopeConfigByType("company")

  // after
  import { getLayer } from "@ydtb/core-server"
  import "@ydtb/tk-scope-platform/layers/scope-hierarchy" // side-effect: LayerMap augmentation
  const cfg = getLayer("scopeHierarchy").getConfigByType("company")
  ```

  `@ydtb/tk-scope-integrations` is patched: its internal `oauth-callback-app.ts` migrated from the deleted API to `getLayer('scopeHierarchy')`. No breaking surface change for integrations consumers.

  See `anvil/docs/STATE_OWNERSHIP.md` for the rule and `#164` for the full migration epic.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (2/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.8.0

## 0.7.0

### Minor Changes

- Migrate monorepo from bun to pnpm as package manager. Bun is preserved
  as a TypeScript runtime for `scripts/*.ts`. All linked-group packages
  bump to 0.7.0 to mark the packaging-mechanism change in the version
  graph. No public API changes; consumers install the same package names
  from the same registry, but the anvil repo itself is now pnpm-driven.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.7.0

## 0.6.3

### Patch Changes

- feat(tool-integrations): scope-aware OAuth redirect + nested drawer route + just-connected banner (tk-scope#1)

  Three combined changes that together ship the scoped post-OAuth landing experience:
  1. **Scope-aware redirect builder** in `oauth-callback-app.ts`. The callback now reads `stateData.scope` + `stateData.scopeId` and produces `${scopePrefix}/integrations/${providerId}?just_connected=1` (success) or `?error=<msg>` (error). Falls back to legacy `/integrations?...` only when the scope config lookup fails. Users completing OAuth at a company or location scope now land at the correctly-scoped integrations page.

  2. **Nested drawer route + URL-driven drawer state.** `/integrations/:providerId` is a child route under the grid. Grid clicks navigate (`router.navigate`) instead of setting local drawer state; the drawer reads the provider from route params; closing navigates back to `/integrations`. Unknown provider ID shows a graceful fallback. Deep-linkable, back-button-friendly, shareable.

  3. **Just-connected banner + URL cleanup.** Landing on the drawer route with `?just_connected=1` fires a one-time success toast and strips the param so refresh doesn't re-fire. Mirrored for `?error=<msg>` error-path toasts.

  Fixes yourdigitaltoolbox/tk-scope#1.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.6.3

## 0.6.2

### Patch Changes

- 63df3be: fix(tk-scope): generate-tailwind-sources emits both src/** and dist/** globs

  Anvil publishes compiled dist-only tarballs (Option C), so `@source "…/src/**/*.{ts,tsx,js,jsx}"` globs generated for published toolkit packages matched zero files. Consumer apps' compiled Tailwind CSS bundles were missing almost every utility class used in toolkit components (including responsive variants, `lg:flex`, etc.) — visible as unstyled nav sidebars, collapsed shells, and other layout breakage.

  The plugin now emits both `src/**/*.{ts,tsx,js,jsx}` AND `dist/**/*.{ts,tsx,js,jsx,mjs,cjs}` globs per tool package. Workspace/dev builds scan `src/`; consumers of published tarballs scan `dist/`. Tailwind tolerates no-match globs, so both shapes work transparently.

  See yourdigitaltoolbox/anvil#153 for the full diagnostic trail.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

- Updated dependencies [63df3be]
  - @ydtb/tk-scope@0.6.2

## 0.6.1

### Patch Changes

- 0fcfcc3: Fix `generate-tailwind-sources` to use ESM `import` for `path`/`fs` instead of CommonJS `require()`. The package is `"type": "module"`, so the `require()` calls failed at runtime when Vite loaded the build plugin (`ReferenceError: require is not defined`). `require.resolve` retained via `createRequire(import.meta.url)`.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

- Updated dependencies [0fcfcc3]
  - @ydtb/tk-scope@0.6.1

## 0.6.0

### Minor Changes

- 53fec2a: Add `integrations:provider-panels` filter so tools can contribute per-provider tabs to `IntegrationDetailPanel`.
  - Export `ProviderPanelEntry` and `ProviderPanelComponentProps` types from the tool's type surface
  - Augment `FilterRegistry` with `'integrations:provider-panels': ProviderPanelEntry[]` for typed hook callbacks
  - `IntegrationDetailPanel` now merges contributed tabs with the static `connections` and `tools` tabs, filtered by active `providerId`
  - Contributed tabs receive `{ providerId, scope, scopeId }` props when rendered
  - Zero-contributor behaviour is unchanged — only `connections` and `tools` tabs are shown

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies [53fec2a]
  - @ydtb/tk-scope@0.6.0

## 0.5.15

### Patch Changes

- Align linked group to 0.5.14 with the prepare-publish CSS-asset fix.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 1 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (42/43 → 43/43). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.15

## 0.5.14

### Patch Changes

- 58f4372: Include src/styles/ in the published tarball

  The `./styles/*` and `./styles` exports point at `./src/styles/*` because CSS files don't go through the tsc build — prepare-publish.ts intentionally passes non-TS export values through unchanged. But the hardcoded `pkg.files = ['dist/', 'package.json']` meant the source CSS files were stripped from the tarball, and consumer imports of `@ydtb/tk-scope-ui/styles/globals.css` failed at build time with "Can't resolve".

  prepare-publish.ts now scans the rewritten exports for `./src/<subdir>/` prefixes and whitelists each referenced subdir (e.g. `src/styles/`) in `files`. Never the whole src/ tree — only the subdirs actually referenced by non-TS exports. Stays narrow enough that dist-first publishing still holds for TS code.

## 0.5.13

### Patch Changes

- Align linked group to 0.5.13 (one-time drift fix after partial cascade from the test-harness postgres-layer dep fix).
- Updated dependencies
  - @ydtb/tk-scope@0.5.13

## 0.5.10

### Patch Changes

- df7c253: Layer-boundary testing for oRPC routers: `createRouterTestClient`

  **New in `@ydtb/tk-scope-test-harness`** — `createRouterTestClient(router, options)` from `@ydtb/tk-scope-test-harness/router-client`. Runs the real oRPC pipeline (scopeAuthed + requirePermission + zod) against memory-backed layer implementations. No HTTP, no Postgres, typical test < 50ms. Tool tests never `vi.mock` framework internals.

  **In `@ydtb/core-server`** — `withLayers` is now generic over its callback's return type: `withLayers<T>(context, () => T): Promise<T>`. Previously returned `Promise<void>`. Non-breaking: the old `Promise<void>` signature was a strict subset of the new generic signature, so all existing callers keep working.

  **Canary migration** — `tools/tool-integrations/src/api/__tests__/router.test.ts` now uses `createRouterTestClient` and passes against oRPC 1.13. Previously failed with `TypeError: default.callback.handler is not a function` because it reached into oRPC 1.12's procedure shape.

  **Removed exports** — the following were exported by `@ydtb/tk-scope-test-harness` pre-consolidation but had no active runtime consumers (grep across anvil+ydtb): `createTestContext`, `callHandler` (orpc-test-client), `createRouterTestHelper` (router-test-helper), `bootPluginForTest` (plugin-test-helper), `renderWithProviders`, `getReactMocks` (react-test-helper), `getTestAliases`, `inlineDeps` (vitest-setup), plus the `./vitest-setup` subpath. These were referenced by stale docs in `ydtb/docs/11-testing.md` (also consolidation-era drift); docs update filed separately. File-level deletes: `router-test-helper.ts`, `router-test-setup.ts`, `orpc-test-client.ts`, `plugin-test-helper.ts`, `react-test-helper.ts`, `react-test-setup.ts`, `vitest-setup.ts`, `db-mock.ts`.

  **Docs** — `docs/TESTING.md` spells out the layer-boundary testing contract and the three-tier harness story (unit / integration / e2e). Includes wildcard-permission caveats and the `sql` stub limitation.

  Closes yourdigitaltoolbox/tk-scope#2.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 40 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (3/43 → 43/43). See VERSIONING.md → Linked-version policy._

- Updated dependencies [df7c253]
  - @ydtb/tk-scope@0.5.10

## 0.5.9

### Patch Changes

- OAuth callback: one URL per provider, framework-served

  Previously the platform constructed all provider redirect URIs as
  `/api/credentials/oauth/callback` and relied on a matching handler that
  didn't exist — every OAuth redirect 404'd. This change gives each
  integration provider a unique callback URL served by the framework:

      /api/oauth/{providerId}/callback

  Consumers mount `createOAuthCallbackApp()` (exported from
  `@ydtb/tk-scope-integrations`) under `/api/oauth` in their `routes` map.
  The default handler runs the standard OAuth2 flow: decode state,
  exchange code for token, upsert `scope_integration`, emit
  `integrations:credential-changed`, redirect to `/integrations?connected=…`.
  Providers with non-standard OAuth flows can override by implementing
  `handleCallback` on their `IntegrationProvider` definition.

  Meta + Google providers updated to derive their redirect URIs from
  `APP_URL` by default; Meta still honors `META_REDIRECT_URI` as an
  explicit override for deployments that want to host the callback on a
  different host (e.g., TLS-terminating reverse proxy on a subdomain).

  Deployment note: existing Meta-for-Developers / Google Cloud OAuth app
  configs need the new redirect URIs (`/api/oauth/meta/callback`,
  `/api/oauth/google/callback`) added to their authorized lists.

- Updated dependencies
  - @ydtb/tk-scope@0.5.9

## 0.5.8

### Patch Changes

- Meta Ads Epic 02 — Meta (Facebook) OAuth provider package.

  New publishable package `@ydtb/core-integration-meta` implementing the `IntegrationProvider` interface for Meta, mirroring the existing `@ydtb/tk-scope-integrations-google` pattern. Targets Graph API v19.0 via versioned `authUrl` / `tokenUrl` / `revokeUrl` / `userInfoUrl` so upgrades are a single-constant change.
  - `buildAuthParams` sets `auth_type=rerequest` for incremental-permission re-prompting (Meta silently drops declined scopes without this) and joins scopes with `,` per Meta's convention.
  - `parseTokenResponse` returns `refreshToken: undefined` — Meta does not issue refresh tokens on the short-lived OAuth response; long-lived token exchange happens at the connection-create layer (Epic 03), not in the provider.
  - `parseUserInfo` prefers `email` as the display label (requires `email` scope), falls back to `name`. Avatar extracted from `picture.data.url`.
  - Env vars: `META_CLIENT_ID`, `META_CLIENT_SECRET`, `META_REDIRECT_URI`.
  - `setupGuide` points at developers.facebook.com with steps for Business app creation + redirect URI configuration.

  31 unit tests cover the provider config, buildAuthParams, parseTokenResponse, parseUserInfo, env accessors, and setup metadata.

  First consumer: the Meta Ads tool (Epic 03 registers this provider via the `integrations:plugins` filter). Also available for generic integrations-tool OAuth flow.

  Added to the linked-group config so it versions in lockstep with the rest of the framework.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 42 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/43 → 43/43). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.8

## 0.5.7

### Patch Changes

- Complete the Revert-to-upstream UX loop.
  - `integrations.listAtScope` now returns `overriddenProviders: string[]` — providers whose local rows shadow a shared+default ancestor. Query fetches all ancestor share-eligible rows (no pre-filter) and computes the overlap with local provider IDs.
  - `ConnectionList` accepts `onRevert` + `shadowsUpstream` props; renders a "Revert to upstream" ghost button next to Disconnect only when both are truthy.
  - `IntegrationDetailPanel` queries `listAtScope`, computes `shadowsUpstream` for the current provider, and wires the mutation against `integrations.revert` with TanStack invalidation + success toast.

  Closes the final missing piece of CSC 04's UX. Gated on `integrations.manage` (same as Disconnect) — no new permission surface.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.7

## 0.5.6

### Patch Changes

- Two post-CSC-ship fixes that close practical gaps in the flow.

  **OAuth callback now persists to `scope_integration`.** The callback handler previously called `handleOAuthCallback` to exchange the code for tokens but never wrote the result anywhere — connections lived only in the in-memory stub and `action: 'created'` emissions never fired. The handler now decodes the state blob (base64url JSON produced by `connect` / `addServices`), then either INSERTs a fresh row or UPDATEs the existing one when `connectionId` is present in state, stamping `encryptionKeyVersion` with `CURRENT_KEY_VERSION` on both paths. Emits `integrations:credential-changed` with `action: 'created'` or `'updated'`.

  **`integrations.updateSharing` endpoint.** Flips `shared` + `defaultForDescendants` on an existing row and emits `action: 'updated'` so the Phase-3 listener purges descendant cache entries. Rejects `defaultForDescendants=true + shared=false` at the boundary — that combination is a contradiction per the resolver's filter. `integrations.detail` now also returns the two flags on each connection so the UI can drive a toggle.

  Together these two changes make CSC actually usable end-to-end: users can complete an OAuth connect and then flip sharing without having to reconnect.

  UI toggle-row on `ConnectionList` is the remaining step — filed as a followup.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.6

## 0.5.5

### Patch Changes

- CSC Phase 4 (Integrations UI) + Phase 5 (OAuth permission gate).

  **Phase 4 — UI:**
  - `@ydtb/tk-scope-ui` — new `InheritanceIndicator` component (value-agnostic, used by CSC first, Correlation later) and `ShareWithDescendantsToggle` (two stacked switches for `shared` + `defaultForDescendants`).
  - `@ydtb/tk-scope-tool-integrations` — new `integrations.listAtScope` oRPC endpoint returning `{ local, inherited }` with server-side permission-gated redaction; new `integrations.revert` endpoint (hard-deletes a local row + emits `action: 'reverted'`); new `SharedIntegrationsSection` + `OverrideInheritedDialog` + revocation cascade UX; `invalidateIntegrationsQueries` helper for mutation onSuccess handlers.
  - `@ydtb/tk-scope-db` — re-exports `notInArray` + `not` from drizzle-orm for consumer queries.

  **Phase 5 — OAuth gate:**
  - `integrations.connect` now walks the scope chain and requires `integrations:override-inherited` when the requested provider is already shared-and-default at an ancestor scope. Closes the permission-bypass hole where a user with `integrations:manage` could previously shadow inherited credentials via direct API call.

  14 new unit tests on the shared UI components. Patch bump per the linked-group policy; all changes additive.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 39 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (3/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.5

## 0.5.4

### Patch Changes

- CSC Phase 3 — Broadcasts + cache invalidation listener.
  - **Emissions.** `disconnect` handler now emits `integrations:credential-changed` with `action: 'revoked'`; `rename` emits with `action: 'updated'`. Refresh (Phase 2) already emits with `action: 'refreshed'`. All use the typed `makeIntegrationsHooks` wrapper.
  - **Listener.** `defineServer` registers an `integrations:credential-changed` broadcast handler that calls `credentialCache.invalidateForChange(payload)`. Completes the invalidation cascade: a mutation on an ancestor now purges every descendant's stale cache entry within the same process tick, closing the staleness window that would otherwise last up to the 10-min TTL.
  - **Tests.** 9 wiring tests cover action registration, broadcast listener registration, delegation to `invalidateForChange`, and acceptance of all 6 `CredentialChangeAction` discriminators.

  Note: the `created` emission path is blocked by a pre-existing gap — the OAuth callback returns token data but never persists to `scope_integration`. Filed as separate debt; outside CSC 03's scope.

  Patch bump per the linked-group policy.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.4

## 0.5.3

### Patch Changes

- CSC Phase 2 — Cache + Resolver Action + Token Refresh. Critical-path unblocker for Meta Ads.
  - `credential-cache.ts` — in-memory LRU (10k entries, 10min TTL) with `invalidateForChange` that purges the changed scope + all descendants for the same provider.
  - `credential-refresh.ts` — `refreshCredentialIfNeeded(db, row)` runs the OAuth refresh against the provider's token endpoint, writes new encrypted tokens, emits the typed `integrations:credential-changed` broadcast with `action: 'refreshed'`. In-memory `Map<credentialId, Promise>` dedupes concurrent refreshes per-process (multi-instance advisory-lock escalation deferred).
  - `credential-resolver.ts` — main `resolveCredentialHandler`: cache lookup → `buildScopeChain` → `resolveIntegration` primitive → refresh-if-needed → decrypt → compute inheritance → cache write → permission-gated redact. Graceful null credential when decrypt fails (rotated key, corruption).
  - `credential-redaction.ts` — `redactForCaller` nulls `ancestorLabel` + `credential.name` when the caller lacks `integrations:view-upstream` at the queried scope. Fail-open on permission-system errors per the CSC error-handling contract.
  - `integrations:resolve-credential` action registered via `defineServer({ hooks: { actions } })` in the tool-integrations server surface — consumer tools dispatch via `getHooks().doAction(...)` or the typed `makeIntegrationsHooks` wrapper.

  34 unit tests across cache, refresh, and resolver. Adds `lru-cache@^11` dep. All changes additive; patch bump per the linked-group policy.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.3

## 0.5.2

### Patch Changes

- cbfeeaa: CSC Phase 1 — Foundation. Additive changes across the linked group:
  - `@ydtb/tk-scope-db` — schema: `shared` + `defaultForDescendants` columns on `scope_integration`. New helpers: `getAllDescendantScopes` (recursive-CTE descendants), `resolveIntegration` (cross-scope credential resolver primitive). `resolveSetting` return now includes structured `source: {scope, scopeId} | null` for UI inheritance labels (existing `lockedBy` preserved).
  - `@ydtb/tk-scope-extension` — `buildScopeChain` rewritten to single recursive CTE; throws a descriptive error on depth overflow instead of silently truncating at 10 levels.
  - `@ydtb/tk-scope-integrations` — new `getIntegrationCredentialsFromDb` service that reads credentials via the resolver primitive. Existing in-memory stub retained; per-consumer migration deferred.
  - `@ydtb/tk-scope-tool-integrations` — CSC type surface (InheritanceState, ResolvedCredential, ResolveCredential\*, CredentialChangeAction, IntegrationsCredentialChangedPayload), `makeIntegrationsHooks` typed-hooks factory, 3 new permissions (`view-inherited`, `view-upstream`, `override-inherited`).

  Patch bump per the linked-group patch-default policy — all changes are additive; no breakings. Linked cascade bumps every package in the group to keep runtime pins aligned.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 38 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (4/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies [cbfeeaa]
  - @ydtb/tk-scope@0.5.2

## 0.5.1

### Patch Changes

- Viewing Scope Phase 3 — Dashboard integration.

  `DashboardViewPage` now wraps content in `<ViewingScopeProvider>` and renders `<ScopeViewSelector>` inside the existing `<HeaderPortal>`. Descendants are fetched via a new `useAvailableDescendants(parentScope, parentScopeId, toolId)` hook in the Dashboard tool that filters the user's scope memberships by parent match + tool-install check.

  Closes Viewing Scope v1 end-to-end. Meta Ads and Correlation can now integrate the hook + selector into their own cards/pages at their own pace.

  Added README sections for `@ydtb/tk-scope` (core) and `@ydtb/tk-scope-ui` with `useViewingScope` + `<ScopeViewSelector>` usage examples.

  Patch per new policy — additive, nothing breaks.

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 41 additional package(s) in the same group were added at `patch` to preserve the shared-version invariant (1/42 → 42/42). See VERSIONING.md → Linked-version policy._

- Updated dependencies
  - @ydtb/tk-scope@0.5.1

## 0.5.0

### Minor Changes

- Viewing Scope Phase 2 — `<ScopeViewSelector>` UI component in `@ydtb/tk-scope-ui`.

  Exports `ScopeViewSelector` + `ScopeViewSelectorProps` + `ScopeViewSelectorPermissionCheck` from `@ydtb/tk-scope-ui/components/scope-view-selector`. Reads `useViewingScope()` to render a dropdown with Aggregate at top and descendants sorted alphabetically; selecting writes URL state. Returns `null` when the parent scope has no descendants with the tool installed. `checkPermission` prop disables descendants the user can't access and wraps the label in a tooltip ("No access to {label}"). Check icon on the currently-selected option. Accessible via Radix DropdownMenu.

  Discovered during VS-T4: `ViewingScopeContextValue` was widened to expose `availableDescendants` so consumers like `<ScopeViewSelector>` can render the list without re-receiving it as a prop. Also added `ViewingScopeDescendant` as a named exported type. Both are additive.

  `@ydtb/tk-scope-ui` now depends on `@ydtb/tk-scope` (workspace:\*) so the component can import the hook.

  Test infra in `@ydtb/tk-scope-ui` received `vitest` as a devDep (was missing; `bun run test` couldn't start in that package before this).

  <!-- auto-expanded by expand-linked-changesets.ts -->

  _Auto-expanded: the author listed a subset of a linked group; 40 additional package(s) in the same group were added at `minor` to preserve the shared-version invariant (2/42 → 42/42). See VERSIONING.md → Linked-version policy._

### Patch Changes

- Updated dependencies
  - @ydtb/tk-scope@0.5.0

## 0.4.2

### Patch Changes

- Align all linked packages at the same version. This changeset only lists `@ydtb/tk-scope` explicitly — the new `expand-linked-changesets.ts` preflight auto-expands to cover every package in the linked group, including the recently-added Cloudflare layers (cf-jobs, cf-sentry, kv, r2).

## 0.4.1

### Patch Changes

- Align all linked packages at 0.4.x after the VS-Phase-1 minor bump to tk-scope + tk-scope-app. Keeps downstream consumers on a single coherent cross-package version so bun's resolution doesn't end up with 0.3.0 + 0.4.0 side-by-side.

## 0.3.0

### Minor Changes

- Switch from source-exported (`./src/*.ts`) to compiled-dist (`./dist/*.d.ts` + `./dist/*.js`) publishing. Consumers now type-check against frozen declarations — duplicate peer-dep installs can no longer cascade into false-positive errors.

  Breaking: consumer projects must run `bun install` to pick up the new export shape. Source imports like `@ydtb/tk-scope-app/src/...` no longer work — use the package-level subpath exports (e.g., `@ydtb/tk-scope-app/client`).

  Includes several upstream fixes:
  - `@ydtb/tk-scope-ui` exports `ButtonProps`; pagination size prop duplication resolved
  - `@ydtb/tk-scope-platform` exports `CredentialDefinition` type
  - `@ydtb/tk-scope-api-client` exports `ToolClient<Router>` helper type (consumers may annotate with it if they hit TS2742)
  - `@ydtb/core-layer-auth` mock `getSession` returns a full `AuthSession` (includes `user` field) and implements `updateSession`
  - `@ydtb/core-layer-cf-sentry` updated for `@sentry/cloudflare` v9 (removed bare `Sentry.init()` — workers should wrap their handler with `withSentry()`)
  - `@ydtb/core-layer-kv` / `-r2` health checks use `Effect.promise(() => ...)` instead of top-level `await` inside generators

## 0.2.3

### Patch Changes

- Align all packages at 0.2.2 so downstream consumers get a consistent tk-scope transitive dep — avoids multi-version resolution cascades in consumer typecheck.

## 0.2.1

### Patch Changes

- Remove `files: ["dist/", "package.json"]` field — packages export `./src/*.ts` and depend on source shipping. 0.2.0 tarballs accidentally contained only package.json because no dist/ build step exists. When compiled-dist publishing is introduced, `files` will be re-added alongside a working build step.

## 0.2.0

### Minor Changes

- Shared framework deps (tanstack/\*, react, react-dom, lucide-react, better-auth, drizzle-orm, zod) are now peerDependencies only. Consumers must provide these at the application level.

  Why: Source-exporting packages that duplicated these as regular deps caused consumer typecheck drift — multiple instances of @tanstack/react-router/react-query would resolve, producing cascade type errors like "Property X does not exist on type '{}'" from useParams and similar. Fixing at the policy level (validate-peers.ts preflight) prevents regression.

  Consumer action required:
  - Pin exact versions of shared peers in apps/\*/package.json
  - Add root-level overrides to collapse any transitive resolutions to the app's version
  - Run `bun pm ls @tanstack/react-router` to confirm a single installed version

## 0.1.10

### Patch Changes

- fix: add appearance-none to Checkbox for Tailwind v4 compatibility

  Tailwind v4 preflight sets `appearance: button` on `<button>` elements.
  The Radix Checkbox renders as a `<button>`, so it retained native button
  styling. Adding `appearance-none` removes the browser default appearance.
