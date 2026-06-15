---
name: "source-command-sanity-push"
description: "Push Sanity schema changes and deploy Sanity Studio"
---

# source-command-sanity-push

Use this skill when the user asks to run the migrated source command `sanity-push`.

## Command Template

# /sanity-push

Sanity schema editing happens in Cursor. This command is for deploying after edits are done.

## Checklist (complete before deploying)

- [ ] Schema changes in `src/sanity/schemaTypes/` are finalized in Cursor
- [ ] `pnpm typegen` — regenerates `src/sanity/types/index.ts`
- [ ] `pnpm typecheck` — zero errors with new types
- [ ] GROQ queries in `src/sanity/lib/queries.ts` updated for schema changes
- [ ] `src/lib/localContent.ts` fallback mapping updated for new queries
- [ ] `Data/*.ndjson` updated if new content type added
- [ ] Existing documents satisfy new validation rules (check in Studio before deploying)

## Deploy

```bash
pnpm sanity deploy
```

Or via npx if `pnpm sanity` isn't wired:
```bash
npx sanity deploy
```

Verify Studio is live at `https://<your-project>.sanity.studio`

## Notes

- Dataset: always `production`
- Studio mounted at `/studio` — protected by Clerk
- Schema changes may show validation errors on old documents — fix or make fields optional
- Use `sanity-schema` agent to review GROQ queries before deploying schema
- Use Sanity MCP (`mcp.sanity.io`) for live document queries and CRUD in Codex sessions
