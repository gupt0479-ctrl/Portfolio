---
name: "source-command-ship-check"
description: "One-command pre-deploy gate — chains typecheck → build → eval → security review. All steps must pass."
---

# source-command-ship-check

Use this skill when the user asks to run the migrated source command `ship-check`.

## Command Template

# /ship-check

Run every step in order. **Stop on the first failure.** Fix it before re-running.

## Step 1 — TypeScript + Build

```bash
pnpm typegen      # sync Sanity schema → types
pnpm typecheck    # TypeScript strict — zero errors
pnpm lint         # Biome — fix with pnpm format then re-check
pnpm build        # full Next.js production build
```

If build fails → run `/build-fix` then retry this step.

## Step 2 — Eval Suite

Run `/eval` (delegates to `eval-runner` agent).

All promptfoo cases must pass. If any fail: stop, surface the failure, do not continue to Step 3.

## Step 3 — Security Review

Invoke the `security-reviewer` agent:
```
Use security-reviewer agent to review the diff
```

Must output **SHIP** before proceeding. It checks:
- No secrets or tokens in changed files
- No `NEXT_PUBLIC_` on server-only keys
- Clerk middleware covers all protected routes
- Sanity token scoped correctly
- Security headers present

## Step 4 — Ready to Deploy

If all three steps pass, run `/deploy` to push to Vercel production.

## Rules

- Never skip a step, even if "nothing changed" in that area
- Fix failures at the step they surface — don't patch downstream and hope
- `/ship-check` is the gate before every production push; `/deploy` handles the actual commit + push
