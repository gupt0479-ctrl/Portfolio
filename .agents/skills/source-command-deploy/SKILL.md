---
name: "source-command-deploy"
description: "Full pre-deploy quality gate + security review + Vercel production push"
---

# source-command-deploy

Use this skill when the user asks to run the migrated source command `deploy`.

## Command Template

# /deploy

Run every step in order. Stop on any failure and fix it before continuing.

## Step 1 — Quality Gate

```bash
pnpm typegen        # sync Sanity schema → src/sanity/types/index.ts
pnpm typecheck      # TypeScript strict — zero errors
pnpm lint           # Biome — fix with pnpm format then re-check
pnpm build          # full Next.js production build
pnpm test           # Vitest — zero failures
```

If `pnpm build` fails → `/build-fix` before retrying.

## Step 2 — Security Review

Invoke the `security-reviewer` agent before touching git:
```
Use security-reviewer agent to review the diff
```

The agent runs grep checks for secrets, NEXT_PUBLIC_ audit, Clerk coverage, Sanity token scope, and security headers. Must output **SHIP** before proceeding to Step 3.

For deep OWASP scan on large diffs also run: `/code-review`

## Step 3 — Staged Changes Review

```bash
git status
git diff --staged
```

Verify: no `.env.local`, no secrets, no unrelated files, no `console.log`.

## Step 4 — Commit

Stage selectively (never `git add .`):
```bash
git add -p
```

Ask for commit message in conventional commit format:
- `feat:` — new feature
- `fix:` — bug fix
- `perf:` — performance improvement
- `refactor:` — refactoring
- `chore:` — tooling/config
- `style:` — UI/visual only

Commit message must be under 72 chars, describe the WHY.

## Step 5 — Push + Monitor

```bash
git push origin main
```

This triggers Vercel auto-deploy. Monitor via Vercel MCP:
```
Use mcp__claude_ai_Vercel__list_deployments to check deploy status
Use mcp__claude_ai_Vercel__get_deployment_build_logs if build fails
Use mcp__claude_ai_Vercel__get_runtime_logs for runtime errors
```

Deploy typically takes 60–120 seconds. Report the production URL when complete.

## Rules

- Never skip Steps 1–2
- Never commit `.env.local`, secrets, or API tokens
- ECC hooks auto-block `--no-verify` — don't try to bypass them
- If Vercel build fails but local build passes: check env var names in Vercel dashboard
