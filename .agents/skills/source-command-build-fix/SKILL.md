---
name: "source-command-build-fix"
description: "Fix TypeScript errors and build failures to zero errors"
---

# source-command-build-fix

Use this skill when the user asks to run the migrated source command `build-fix`.

## Command Template

# /build-fix

Capture all errors first, then fix in priority order.

## Step 1 — Capture Everything

```bash
pnpm typegen 2>&1          # always sync types first
pnpm typecheck 2>&1        # TypeScript strict
pnpm build 2>&1 | head -80 # Next.js build errors
```

Run all three before touching any file — understand the full error surface.

## Step 2 — Fix in Priority Order

| Error pattern | First action |
|--------------|--------------|
| Type in `src/sanity/types/` | `pnpm typegen` — types are stale, regenerate |
| `Module not found` | Check `@/*` alias → `src/*`. Verify file exists. |
| `Property does not exist` on Sanity type | Run `pnpm typegen`, then check GROQ projection |
| `"use client"` missing | Add directive at top of file, or extract to a hook |
| Three.js SSR error | `next/dynamic(() => import(...), { ssr: false })` |
| `auth()` in Client Component | Move to Server Component or use `useUser()` hook |
| `await` missing on `params`/`searchParams` | Next.js 16 — these are Promises, always await |
| Generic type error | Fix the type — never `as any` or `@ts-ignore` |

## Step 3 — Verify

```bash
pnpm typecheck   # must be 0 errors
pnpm build       # must succeed
```

## ECC Delegation

For complex or cascading TypeScript errors, delegate to the specialist:
```
Spawn everything-Codex:build-error-resolver
```

This agent makes minimal diffs and does not refactor — it's surgical.

## Common Root Causes

- Schema changed but `pnpm typegen` not run → `src/sanity/types/index.ts` stale
- Three.js imported directly in a Server Component → wrap with `next/dynamic`
- `await sanityFetch()` missing → it always returns a Promise
- `localContent.ts` not updated after new query → add the mapping
- Clerk `auth()` called in a `'use client'` file → move to server context
