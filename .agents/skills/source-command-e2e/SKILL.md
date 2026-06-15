---
name: "source-command-e2e"
description: "Generate and run Playwright end-to-end tests for portfolio flows, capture screenshots"
---

# source-command-e2e

Use this skill when the user asks to run the migrated source command `e2e`.

## Command Template

# /e2e

Delegates to ECC `e2e-runner` agent which uses Playwright (Vercel Agent Browser preferred, Playwright fallback). Use after UI changes to verify critical paths haven't regressed.

## What to Test in This Portfolio

**Critical flows:**
1. Portfolio loads — Three.js background visible, hero text renders
2. Navigation scrolls to correct sections
3. Projects section — cards render with correct tech stack chips
4. Contact form — validates input, shows success/error states
5. PortfolioLab sidebar — opens from toggle, all 4 modes return content
6. `/studio` route — redirects to Clerk sign-in when unauthenticated

**Visual regression targets:**
- ObsidianBackground canvas renders (not blank)
- Cosmic cards have correct translucency (not white, not transparent)
- Section kicker text matches spec (e.g., "// trajectory" for Experience)

## Run ECC E2E

```
/e2e
```

ECC's `e2e-runner` will:
1. Start the dev server or connect to preview URL
2. Generate test scenarios from your description
3. Run Playwright, capture screenshots and traces
4. Upload artifacts
5. Report pass/fail per flow

## Custom Scenario (give context to the agent)

When invoking `/e2e`, describe what changed:
```
/e2e — verify Projects section renders after adding new project via Sanity
/e2e — smoke test full page load and navigation scroll behavior
/e2e — test PortfolioLab all 4 modes return responses
```

## Manual Quick Check

For a fast smoke test before deploy:
```bash
pnpm dev &
# Then open browser at localhost:3000 and verify:
# 1. Background canvas loads
# 2. Hero text visible
# 3. Navigation scrolls correctly
# 4. No console errors (check DevTools)
```
