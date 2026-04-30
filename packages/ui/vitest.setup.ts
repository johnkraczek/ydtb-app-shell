// Use the explicit `expect.extend(matchers)` pattern instead of
// `import "@testing-library/jest-dom/vitest"` to keep matcher registration
// on the same `expect` instance the test runner uses.
//
// Why: the umbrella workspace resolves multiple vitest peer-contexts (jsdom
// peer-dep variation across packages explodes vitest into 7 distinct copies
// in pnpm's store). When jest-dom's `dist/vitest.js` does `require('vitest')`,
// it resolves through jest-dom's own peer-context — which is not necessarily
// the same vitest instance the runner uses for this package. The implicit
// registration then lands on the wrong `expect`, leaving the runner with
// "Invalid Chai property: toBeInTheDocument" on every matcher call.
//
// The explicit form below resolves `vitest` through THIS package's
// peer-context, guaranteeing match with the runner.
import { expect } from "vitest"
import * as matchers from "@testing-library/jest-dom/matchers"

expect.extend(matchers)
