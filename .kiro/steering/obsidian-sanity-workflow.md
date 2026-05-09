---
inclusion: manual
---

# Obsidian → Sanity Content Workflow

This guide covers how to pull content from Obsidian and push it to Sanity CMS.

## Content Mapping

### Obsidian Note → Sanity Blog Post
| Obsidian Field | Sanity Field | Notes |
|---|---|---|
| `title` (frontmatter) | `title` | Direct map |
| filename slug | `slug.current` | Kebab-case from title |
| `tags` (frontmatter) | `tags` | Array of strings |
| `category` (frontmatter) | `category` | Single string |
| `created` / `date` | `publishedAt` | ISO date string |
| Body content (markdown) | `content` (Portable Text) | Convert MD → blocks |
| `excerpt` (frontmatter) | `excerpt` | First paragraph if missing |
| `readTime` (frontmatter) | `readTime` | Calculate from word count if missing (~200 wpm) |

### Obsidian Note → Sanity Project
| Obsidian Field | Sanity Field | Notes |
|---|---|---|
| `title` | `title` | Direct map |
| `tagline` / first line | `tagline` | Short description |
| `tech` / `technologies` | `technologies` | Reference skill documents by name |
| `category` | `category` | Must match enum: web-app, mobile-app, ai-ml, etc. |
| `live_url` / `url` | `liveUrl` | Direct map |
| `github` / `repo` | `githubUrl` | Direct map |
| `featured` | `visibility` | "featured" or "standard" |

### Obsidian Note → Sanity Experience
| Obsidian Field | Sanity Field | Notes |
|---|---|---|
| `company` | `company` | Direct map |
| `position` / `role` | `position` | Direct map |
| `type` | `employmentType` | full-time, part-time, contract, freelance, internship |
| `location` | `location` | Direct map |
| `start_date` | `startDate` | ISO date |
| `end_date` | `endDate` | ISO date or null if current |
| Bullet points | `responsibilities` | Array of strings |
| `achievements` | `achievements` | Array of strings |

## Workflow Steps

### 1. Search Obsidian for Content
```
Use obsidian_global_search to find notes by topic
Use obsidian_list_notes to browse folder structure
Use obsidian_read_note to get full content
```

### 2. Extract Structured Data
- Parse frontmatter for metadata fields
- Extract body content for rich text
- Identify tags, categories, and references

### 3. Transform to Sanity Format
- Convert markdown body to Sanity Portable Text blocks
- Resolve skill/technology references to existing Sanity document IDs
- Generate slugs from titles
- Calculate read times from word count

### 4. Push to Sanity
- Use the Sanity MCP server to create/update documents
- Check for existing documents first to avoid duplicates (match by title or slug)
- Upload images separately if referenced

## Portable Text Conversion Rules
When converting Obsidian markdown to Sanity Portable Text:
- `# Heading` → block with style "h1"
- `## Heading` → block with style "h2" (and so on)
- `> Quote` → block with style "blockquote"
- `- Item` → block with listItem "bullet"
- `1. Item` → block with listItem "number"
- `**bold**` → span with mark "strong"
- `*italic*` → span with mark "em"
- `[text](url)` → span with markDef type "link"
- Plain paragraphs → block with style "normal"

## Valid Category Enums
Projects: web-app, mobile-app, ai-ml, api-backend, devops, open-source, cli-tool, desktop-app, browser-extension, game, other
Skills: frontend, backend, ai-ml, devops, database, mobile, cloud, testing, design, tools, soft-skills, other
Achievements: award, hackathon, publication, speaking, open-source, milestone, recognition, other
Employment: full-time, part-time, contract, freelance, internship
