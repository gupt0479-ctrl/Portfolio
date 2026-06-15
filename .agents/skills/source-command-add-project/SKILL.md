---
name: "source-command-add-project"
description: "Add a new project to the portfolio via Sanity CMS"
---

# source-command-add-project

Use this skill when the user asks to run the migrated source command `add-project`.

## Command Template

# /add-project

Usage: `/add-project <project name>`

## Collect This Information

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | display name |
| `slug` | string | auto-slugify: lowercase, hyphens |
| `description` | string | 1–2 sentences |
| `techStack` | string[] | `['TypeScript', 'Next.js', ...]` |
| `githubUrl` | string | optional |
| `liveUrl` | string | optional |
| `featured` | boolean | show in featured section? |
| `order` | number | sort position (check existing to avoid conflicts) |

## Option A — Sanity MCP (preferred when connected)

The Sanity MCP is configured in `.Codex/mcp.json`. Use it:

```json
{
  "_type": "project",
  "title": "...",
  "slug": { "current": "slugified-title" },
  "description": "...",
  "techStack": ["TypeScript", "Next.js"],
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://...",
  "featured": true,
  "order": 10
}
```

## Option B — Sanity Studio

1. Open `/studio` in browser (requires Clerk sign-in)
2. Navigate to Projects → Create new
3. Fill all fields → Publish

## Option C — NDJSON fallback (offline dev only)

Add an entry to `Data/projects.ndjson` following the existing format.

## After Adding

1. `pnpm dev` → verify project appears in Projects section
2. Check `src/lib/localContent.ts` if it doesn't show (NDJSON fallback may need updating)
3. Confirm ProjectsSlider card renders correctly
4. Check ProjectsSlider layout doesn't break with the new card count
