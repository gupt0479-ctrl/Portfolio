# Bugfix Requirements Document

## Introduction

The portfolio codebase has accumulated significant technical debt from rapid AI-assisted development, resulting in exposed secrets, dead code, unused dependencies, architectural inconsistencies, invalid HTML, and documentation gaps. These issues collectively degrade maintainability, inflate bundle size by 500KB+, create security vulnerabilities, and produce invalid markup. This cleanup addresses all categories systematically to restore a professional, maintainable codebase.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `.mcp.json` is tracked in version control THEN the system exposes a plaintext Obsidian API token (`bb7145f6...`) to anyone with repository access

1.2 WHEN the project has both `proxy.ts` (root) and `src/proxy.ts` THEN the system has two conflicting middleware files with different route protection logic, where the root version uses an undocumented Next.js 16 `respondWith` hack and `src/proxy.ts` uses standard Clerk middleware

1.3 WHEN the project has both `src/sanity/lib/serverClients.ts` and `src/sanity/lib/server-client.ts` THEN the system has two duplicate Sanity server clients with inconsistent token validation — one throws if the token is missing, the other silently uses `undefined`

1.4 WHEN dead code files exist (`Socials.tsx`, `chat/`, `useMousePosition.ts`, `useTilt.ts`, `DarkModeToggle.tsx`, `EducationEntry.tsx`, `ContactForm.tsx`, `DisableDraftMode.tsx`, `world-map.tsx`, `chart.tsx`, `spinner.tsx`, `card.tsx`, `dropdown-menu.tsx`) THEN the system ships 13+ files that are never imported, increasing cognitive load and repository noise

1.5 WHEN unused dependencies exist in `package.json` (`framer-motion`, `styled-components`, `@tabler/icons-react`, `dotted-map`, `groq`, `radix-ui`, `react-intersection-observer`) THEN the system inflates `node_modules` and potentially the production bundle with 7+ packages that are never imported in source code

1.6 WHEN `framer-motion` and `motion` are both listed as dependencies THEN the system ships two copies of the same animation library, where `ProjectsSlider.tsx` imports from `framer-motion` while all other files use `motion/react`

1.7 WHEN `src/app/page.tsx` wraps content in `<main>` AND `PortfolioContent.tsx` also wraps content in `<main>` THEN the system produces nested `<main>` elements which is invalid HTML

1.8 WHEN `CHAT_PROFILE_QUERY` exists in `src/sanity/lib/queries.ts` THEN the system retains a dead query from the removed ChatKit feature that is never used

1.9 WHEN `SkillsSectionClient.tsx` imports `Legend` from recharts THEN the system has an unused import that increases bundle size and creates linting noise

1.10 WHEN `EducationFlowchart` has fewer than 3 items from Sanity THEN the system pads with hardcoded fake "Delhi Public School" entries instead of rendering only real data

1.11 WHEN the Footer component renders THEN the system displays a hardcoded `© 2026` instead of dynamically computing the current year

1.12 WHEN `localContent.ts` matches queries using `query.includes('_type == "profile"')` THEN the system returns the full profile object for both `AboutSection` and `ContactSection` queries without distinguishing between them

1.13 WHEN hooks are organized in the project THEN the system splits them across two locations (`src/hooks/` and `src/lib/hooks/`) with no clear organizational reason

1.14 WHEN `BlogFeed.tsx` renders blog post links THEN the system links to `/blog/${slug}` but no `/blog/[slug]` page route exists, creating broken navigation

1.15 WHEN `StudioClient.tsx` runs THEN the system suppresses all console errors to hide a `disableTransition` prop warning, masking real errors

1.16 WHEN `README.md` is viewed THEN the system shows a README that has been updated but `MEMORY.md` still references `ecc-setup-guide.md` at root when the file is actually at `.cursor/MEMORY/ecc-setup-guide.md`

### Expected Behavior (Correct)

2.1 WHEN `.mcp.json` contains secrets THEN the system SHALL ensure it is listed in `.gitignore` and not tracked in version control, with only `.mcp.example.json` (containing placeholder values) committed

2.2 WHEN middleware is needed for route protection THEN the system SHALL have exactly one middleware file using the standard Clerk middleware pattern, with the unused duplicate removed

2.3 WHEN a Sanity server client is needed THEN the system SHALL have exactly one server client file with proper token validation that throws a clear error if the token is missing

2.4 WHEN files are not imported anywhere in the codebase THEN the system SHALL have those dead files removed from the repository

2.5 WHEN dependencies are listed in `package.json` THEN the system SHALL only include packages that are actually imported in source code, with unused packages removed

2.6 WHEN animation is needed THEN the system SHALL use a single motion library (`motion`) consistently across all files, with `framer-motion` removed and `ProjectsSlider.tsx` updated to import from `motion/react`

2.7 WHEN the page renders THEN the system SHALL have exactly one `<main>` element in the document hierarchy, with the duplicate removed from either `page.tsx` or `PortfolioContent.tsx`

2.8 WHEN queries are defined in `src/sanity/lib/queries.ts` THEN the system SHALL only contain queries that are actively used, with dead queries like `CHAT_PROFILE_QUERY` removed

2.9 WHEN components import modules THEN the system SHALL only import symbols that are actually used in the component's JSX or logic

2.10 WHEN `EducationFlowchart` receives fewer than 3 items from Sanity THEN the system SHALL render only the real data without padding with hardcoded fake entries

2.11 WHEN the Footer component renders THEN the system SHALL display the current year dynamically using `new Date().getFullYear()`

2.12 WHEN `localContent.ts` matches queries THEN the system SHALL use distinct, unambiguous matching logic that correctly differentiates between queries requesting different subsets of profile data

2.13 WHEN hooks are organized in the project THEN the system SHALL consolidate all hooks into a single `src/hooks/` directory

2.14 WHEN `BlogFeed.tsx` renders blog post links THEN the system SHALL either link to an existing route or disable/remove the links until the route is created

2.15 WHEN `StudioClient.tsx` handles console errors THEN the system SHALL not suppress real errors; the `disableTransition` prop warning should be fixed at its source rather than masked

2.16 WHEN `MEMORY.md` references files THEN the system SHALL use correct file paths that match the actual file locations in the repository

### Unchanged Behavior (Regression Prevention)

3.1 WHEN Clerk authentication is configured THEN the system SHALL CONTINUE TO protect the `/studio` route and other non-public routes with Clerk auth

3.2 WHEN `sanityFetch` is called with any active query THEN the system SHALL CONTINUE TO return correct data from Sanity or fall back to local NDJSON content

3.3 WHEN the portfolio page loads THEN the system SHALL CONTINUE TO render all sections (Hero, About, Experience, Projects, Skills, Education, Certifications, Achievements, Blog, Contact, Footer) in the correct order

3.4 WHEN Three.js background and `ProjectsSlider` render THEN the system SHALL CONTINUE TO display animations and 3D content correctly after migrating to the `motion` import

3.5 WHEN the Portfolio Lab sidebar is opened THEN the system SHALL CONTINUE TO function with all four modes (Recruiter, Builder, Research, Skeptic) without requiring sign-in

3.6 WHEN `shadcn/ui` components that ARE actively used (tooltip, dialog, separator, slot) are rendered THEN the system SHALL CONTINUE TO function correctly after removing unused UI component files

3.7 WHEN existing tests run via `pnpm test` THEN the system SHALL CONTINUE TO pass (with updates only for tests that reference removed dead code)

3.8 WHEN the production build runs via `pnpm build` THEN the system SHALL CONTINUE TO complete successfully with no type errors

3.9 WHEN navigation links are clicked THEN the system SHALL CONTINUE TO scroll to the correct portfolio sections

3.10 WHEN the site is viewed on mobile devices THEN the system SHALL CONTINUE TO be responsive and functional

3.11 WHEN Sanity Studio is accessed at `/studio` THEN the system SHALL CONTINUE TO load and function correctly for authenticated users

3.12 WHEN `SkillsSectionClient` renders the skills chart THEN the system SHALL CONTINUE TO display the chart correctly after removing the unused `Legend` import
