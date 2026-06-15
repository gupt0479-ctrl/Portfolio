---
name: "source-command-review"
description: "Full code review — ECC quality scan + project-specific checks + security gate"
---

# source-command-review

Use this skill when the user asks to run the migrated source command `review`.

## Command Template

# /review

Three-layer review. Run all three, report findings by layer.

## Layer 1 — ECC Automated Review

```
/code-review
```

ECC spawns `everything-Codex:code-reviewer` + `everything-Codex:typescript-reviewer` over the diff. Covers: type safety, async correctness, OWASP Top 10, dead code, abstraction quality.

For a larger diff or pre-merge review use cloud multi-agent:
```
/code-review ultra
```

## Layer 2 — Project-Specific Checks

Run these manually (grep commands) and audit the results:

**Architecture**
```bash
# Server Components using useState/useEffect (should be 'use client')
grep -rn "useState\|useEffect" src/components/sections/ --include="*.tsx" | grep -v "'use client'"

# Three.js without dynamic import
grep -rn "from '@react-three\|from 'three'" src/components/sections/ --include="*.tsx"

# Hardcoded content (should come from sanityFetch)
grep -rn "Anant Gupta\|Minneapolis\|University of Minnesota" src/components/ --include="*.tsx"
```

**Performance**
```bash
# Missing next/image
grep -rn "<img " src/ --include="*.tsx" --include="*.jsx"

# console.log in production
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test."

# 'use client' in sections that could be server components
grep -rn "'use client'" src/components/sections/ --include="*.tsx"
```

**UI Consistency**
```bash
# Custom translucent card styles instead of .cosmic-card
grep -rn "backdrop-filter\|rgba(9, 10" src/components/sections/ --include="*.tsx" | grep -v "globals.css"

# Icon-only buttons without aria-label
grep -rn "<button\|<Button" src/components/ --include="*.tsx" | grep -v "aria-label"
```

**Sanity / Content**
```bash
# GROQ queries not using defineQuery()
grep -rn "groq\`\|const.*Query.*=.*\`" src/sanity/ --include="*.ts" | grep -v "defineQuery"

# Manual edits to generated types
git diff HEAD src/sanity/types/index.ts | head -20
```

## Layer 3 — Security Gate

Invoke `security-reviewer` agent:
```
Use security-reviewer agent to review for deploy readiness
```

## Quality Gate

After reviewing all three layers:
```bash
pnpm typecheck && pnpm lint
```

Report all findings with `file:line` references. Separate BLOCKER (must fix before deploy) from WARNING (should fix soon) from INFO (low priority).
