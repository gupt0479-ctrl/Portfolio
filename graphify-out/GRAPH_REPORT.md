# Graph Report - portfolio  (2026-06-13)

## Corpus Check
- 145 files · ~124,863 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1283 nodes · 2251 edges · 109 communities (90 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6aef4283`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 96|Community 96]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 98 edges
2. `sanityFetch()` - 35 edges
3. `Data Overview` - 22 edges
4. `CometCard()` - 21 edges
5. `useSidebar()` - 20 edges
6. `GROQ Query Examples` - 18 edges
7. `Sanity Portfolio Local Fallback Data` - 17 edges
8. `getLocalDataForQuery()` - 16 edges
9. `Sanity Portfolio Dummy Data` - 16 edges
10. `urlFor()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `urlFor()`  [EXTRACTED]
  src/app/(portfolio)/layout.tsx → /home/anant_gupta/projects/portfolio/src/sanity/lib/image.ts
- `OrbyModel()` --calls--> `cn()`  [EXTRACTED]
  src/components/orby/OrbyModel.tsx → /home/anant_gupta/projects/portfolio/src/lib/utils.ts
- `Spinner()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/spinner.tsx → /home/anant_gupta/projects/portfolio/src/lib/utils.ts
- `ChartContainer()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/chart.tsx → /home/anant_gupta/projects/portfolio/src/lib/utils.ts
- `DropdownMenuContent()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → /home/anant_gupta/projects/portfolio/src/lib/utils.ts

## Communities (109 total, 19 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (68): asBoolean(), asNumber(), asRecord(), asString(), asStringArray(), capitalize(), DATA_DIR, getLocalAchievements (+60 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (32): ChatInputBar(), ChatInputBarProps, ChatMessage, ChatThread(), ChatThreadProps, ToolResult, EvidenceCard(), EvidenceCardProps (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (27): ContactPanel(), ContactProfile, IridSocialButton(), SocialLinks, useIridescentEffect(), UseIridescentEffectOptions, CONTACT_QUERY, CTA_BUTTONS (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (36): cn(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (25): formatCategory(), normalizeCategoryKey(), AnimatedLineProps, buildAreaPath(), buildSmoothPath(), CATEGORY_COLORS, CategoryData, directionPhrase() (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (10): achievement, blog, contact, education, experience, navigation, profile, project (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (31): 🏆 Achievements Data (7 achievements), 📝 Blog Posts Data (6 articles), 📜 Certifications Data (5 certifications), code:block1 (Profile), 📧 Contact Submissions Data (3 sample messages), Current Profile Snapshot, Data Overview, 🔗 Data Relationships (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (25): aboutPath, cometCardPath, { container }, css, CTA_HREFS, driftMatch, floatBtnRule, GLOBALS_CSS_PATH (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (22): BLOB_CLIP_PATHS, BLOB_COLORS, BLOB_ICONS, BLOB_SIZES, BLOB_VARIANTS, BlobVariant, FlowchartItem, FlowchartNode() (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (15): Home(), Footer(), PortfolioContent(), ACHIEVEMENTS_QUERY, BLOG_QUERY, CERTIFICATIONS_QUERY, CHAT_PROFILE_QUERY, EDUCATION_QUERY (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (12): lora, metadata, RootLayout(), ubuntu, ChatTokenInit(), Orby, OrbyLoader(), Providers() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (23): AI Chatbot — Phases 0–6 Complete, Architecture, Build Pipeline to Zero Errors, CLAUDE.md — Claude's Source of Truth, code:bash (pnpm typegen        # 1. Sync Sanity schema → src/sanity/typ), Commands, Content Flow, Current Architecture (+15 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (19): Agent Delegation (Claude Code), Authentication And Routing, Before Handing Off, Claude Code — ECC Workflow, Codex Project Skills And Hooks, Coding Standards, Commands, Content Flow (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (17): allText, diverseInputs, dots, inputEl, messageCounts, messages, MotionDiv, NON_EMPTY_INPUTS (+9 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (14): burstLimit, dailyLimit, redis, DEGRADED_ORBY_MESSAGES, DegradedTemplates, detectIntent(), getDegradedNavigation(), getDegradedOrbyMessage() (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (15): CATEGORY_COLORS, EMPLOYMENT_LABELS, Experience, ExperienceCard(), ExperienceCardProps, getCategoryColor(), CATEGORY_COLORS, getCategoryColor() (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.1
Nodes (20): 10. **blog.ndjson**, 11. **profile-with-animation.ndjson**, 1. **profile.ndjson**, 2. **experience.ndjson**, 3. **skills.ndjson**, 4. **education.ndjson**, 5. **certifications.ndjson**, 6. **achievements.ndjson** (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (15): Experience, ExperienceEvidenceCard(), ExperienceEvidenceCardProps, formatDate(), formatDateRange(), Project, ProjectEvidenceCard(), ProjectEvidenceCardProps (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (16): Anant Gupta Portfolio, code:bash (pnpm install), code:bash (NEXT_PUBLIC_SANITY_PROJECT_ID=...), code:bash (pnpm dev), code:bash (pnpm typegen), code:bash (pnpm test), code:bash (bash codex/install-skills.sh), code:bash (bash codex/hooks/pre-task.sh) (+8 more)

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (13): useIsMobile(), CAM_END, CAM_START, clamp01(), createPointSprite(), createRing(), createStars(), fibonacciSphere() (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (17): 1. Local Character Animation, 2. Scroll-Progress Animation, 3. Section-Triggered Messages, Acceptance Criteria, Copy Bank, Current Portfolio Context, Experience Summary, Implementation Direction (+9 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (17): Add New Section, Agents Most Useful for You, code:bash (# 1. Install plugin), code:block2 (/everything-claude-code:plan "Add projects section"), code:block3 (/build-fix), code:block4 (/security-scan), code:block5 (/update-docs), code:json ({) (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (17): 1. Local Character Animation, 2. Scroll-Progress Animation, 3. Section-Triggered Messages, Acceptance Criteria, Copy Bank, Current Portfolio Context, Experience Summary, Implementation Direction (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.21
Nodes (9): ACHIEVEMENTS_SECTION_QUERY, AchievementsSection(), CertificationsSection(), CERTS_SECTION_QUERY, CertWithSkills, CometCard(), CometCardVariant, SpaceRail() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (10): EducationFlowchart(), urlFor(), hasUsableData(), live, loadLocalQueryResult(), sanityFetch(), PROFILE_QUERY, EDUCATION_SECTION_QUERY (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.23
Nodes (11): buildNavItems(), CORE_NAV, HeaderScrolling(), HeaderScrollingProps, isExternalHref(), NavItem, NavLink(), SECTION_IDS (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.14
Nodes (15): buildChatTools(), ContactResult, GetResumeResult, getSanityClient(), LookupFactResult, NavigateResult, NONE_SENTINEL, SECTION_IDS (+7 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (14): aboutPath, { container }, css, floatBtnMatch, globalsPath, glowElements, mockProfile, MotionDiv (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (7): client, builder, serverClient, token, assertValue(), dataset, projectId

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (12): assistantWrappers, chatInput, closeBtn, cloud, el, ERRORS, labButton, orbyWrapper (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (10): AboutTelemetry(), CANONICAL_READOUTS, CanonicalReadout, findStat(), SPARKLINE_BARS, STAT_ICONS, TelemetryCard(), TelemetryCardProps (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (12): code:groq (*[_type == "education"] | order(endDate desc){), code:groq (*[_type == "siteSettings"][0]{), code:groq (*[), 🎓 Education Queries, Get all education (newest first), Get site settings, GROQ Query Examples, 📚 Resources (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (11): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartLegendContentProps, ChartPayloadItem, ChartTooltipContent() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.21
Nodes (10): OrbySpeechCloud(), OrbySpeechCloudProps, speechCloudTransition, speechCloudVariants, prefersReducedMotion(), useTypedText(), clearIntervalSpy, { result } (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (11): 📚 Additional Resources, 📊 Data Statistics, ⚠️ Important: Singleton Documents, 🆘 Need Help?, 🎯 Next Steps After Import, 🖼️ Note About Images, 🔄 Order of Import (Important!), Sanity Portfolio Dummy Data (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (10): INTRO_COPY, LAB_HINT_COPY, OrbyState, OrbyStateResult, pickRandom(), PositionModifiers, SECTION_COPY, SECTION_OBSERVER_CONFIG (+2 more)

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (4): getPose(), Orby(), OrbyArrow(), OrbyArrowProps

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (4): structure(), schema, StudioPage(), StudioClient()

### Community 40 - "Community 40"
Cohesion: 0.32
Nodes (8): BlogFeed(), formatPostDate(), GitHubCard(), MagneticButton(), PINNED_GITHUB, BLOG_SECTION_QUERY, BlogSection(), Blog

### Community 41 - "Community 41"
Cohesion: 0.17
Nodes (12): code:bash (npm install -g @sanity/cli), code:bash (# Check your .env.local file has:), code:bash (sanity login), code:bash (sanity dataset create production), code:bash (npm run typegen), Issue: "Authentication required", Issue: "Command not found: sanity", Issue: "Dataset not found" (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (9): content, idx, liveSource, localContentSource, paddedCount, QUERY_TYPE_MAPPINGS, readSource(), ROOT (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.2
Nodes (7): PanelOrby(), PanelOrbyProps, PanelOrbyState, AstronautProps, OrbyCanvas(), OrbyCanvasProps, SceneProps

### Community 44 - "Community 44"
Cohesion: 0.35
Nodes (9): { container }, getGlareOverlay(), getInnerCard(), glare, inner, makeMotionValue(), MotionDiv, React (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.35
Nodes (5): submitContactForm(), assertValue(), getServerClient(), ServerClient, token

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (11): 📝 Blog Queries, code:groq (*[_type == "blog"] | order(publishedAt desc){), code:groq (*[_type == "blog" && featured == true] | order(publishedAt d), code:groq (*[_type == "blog" && slug.current == $slug][0]{), code:groq (*[_type == "blog" && category == "tutorial"] | order(publish), code:groq (*[_type == "blog" && "React" in tags] | order(publishedAt de), Get all blog posts (newest first), Get blog post by slug with full content (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.36
Nodes (8): allFiles, BANNED_STRINGS, content, EXCLUDED_FILES, getAllSourceFiles(), relativePath, srcDir, violations

### Community 48 - "Community 48"
Cohesion: 0.27
Nodes (9): ChatTools, google, groq, isQuotaError(), LiveResult, routeChat(), RouterOpts, RouterResult (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.36
Nodes (6): HeroTerminal(), ORBITING_CHIPS, TERMINAL_LINES, MotionDiv, MotionSpan, React

### Community 50 - "Community 50"
Cohesion: 0.2
Nodes (10): code:env (NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id), code:bash (# Navigate to the Data folder), code:bash (# From the project root), code:bash (# From the Data folder), Environment Variables, Method 1: Import All Data at Once (Recommended), Method 2: Import Using One Command, Method 3: Import Specific Files Only (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (6): AppSidebar(), SidebarToggle(), PortfolioLab(), Sidebar(), SidebarContent(), useSidebar()

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (5): achievements, blogUrls, certPatches, client, experiencePatches

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (8): isAllowedOrigin(), POST(), buildSystemPrompt(), fetchCatalog(), getSanityClient(), Catalog, CHAT_CATALOG_QUERY, getPersonaBlock()

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (9): code:groq (*[_type == "skill"] | order(order asc){), code:groq (*[_type == "skill" && featured == true] | order(order asc){), code:groq (*[_type == "skill" && category == "frontend"] | order(name a), code:groq ({), Get all skills, Get featured skills only, Get skills by category, Group skills by category (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (9): code:groq (*[_type == "project"] | order(order asc){), code:groq (*[_type == "project" && featured == true] | order(order asc)), code:groq (*[_type == "project" && slug.current == "ai-powered-content-), code:groq (*[_type == "project" && category == "ai-ml"]{), Get all projects, Get featured projects only, Get project by slug, Get projects by category (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (9): Basic Import (Replace Mode), code:bash (sanity dataset import <filename>.ndjson <dataset-name> --rep), code:bash (sanity dataset import <filename>.ndjson <dataset-name>), code:bash (# Import to development dataset), code:bash (sanity dataset import <filename>.ndjson <dataset-name> --mis), 📋 Import Command Options, Import to Different Dataset, Import Without Replacing (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (6): el, IntersectionCallback, MockObserverInstance, mockObservers, { result }, SECTION_TEXTS

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (4): IOCallback, MockIOInstance, mockIOs, { result }

### Community 59 - "Community 59"
Cohesion: 0.57
Nodes (5): clerk, config, event, isPublicRoute, proxy()

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (7): code:groq (*[_type == "contact"] | order(submittedAt desc){), code:groq (*[_type == "contact" && status == "new"] | order(submittedAt), code:groq (*[_type == "contact" && priority == "high"] | order(submitte), 📧 Contact Queries, Get all contact submissions (newest first), Get high priority contacts, Get unread contacts

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (7): About page data, code:groq ({), code:groq ({), code:groq ({), 🎯 Combined / Complex Queries, Homepage data (everything you need for a homepage), Portfolio page data

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (7): Animated Headline Feature, Before Importing, code:json ("siteTitle":"Anant Gupta - Portfolio" → "siteTitle":"Your Na), code:json ("firstName":"John" → "firstName":"YourName"), 🎨 Customizing the Data, Example: Updating Profile Data, Example: Updating Site Settings

### Community 64 - "Community 64"
Cohesion: 0.53
Nodes (4): amoebaIdx, content, formingIdx, stableIdx

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (6): code:groq (*[_type == "blog" && slug.current == $slug][0]), code:groq (image{), code:groq (*[_type == "project"]{), code:groq (count(*[_type == "blog" && featured == true])), code:groq ({), 💡 Pro Tips

### Community 68 - "Community 68"
Cohesion: 0.4
Nodes (3): csp, nextConfig, securityHeaders

### Community 69 - "Community 69"
Cohesion: 0.4
Nodes (3): config, isPublicRoute, isStudioRoute

### Community 71 - "Community 71"
Cohesion: 0.6
Nodes (3): content, readSrc(), sectionsWithBackdrop

### Community 73 - "Community 73"
Cohesion: 0.4
Nodes (5): 📜 Certifications Queries, code:groq (*[_type == "certification"] | order(issueDate desc){), code:groq (*[_type == "certification" && (expiryDate == null || expiryD), Get active certifications (not expired), Get all certifications (newest first)

### Community 74 - "Community 74"
Cohesion: 0.4
Nodes (5): 🏆 Achievements Queries, code:groq (*[_type == "achievement"] | order(date desc){), code:groq (*[_type == "achievement" && featured == true] | order(date d), Get all achievements (newest first), Get featured achievements

### Community 75 - "Community 75"
Cohesion: 0.4
Nodes (5): code:groq (*[_type == "profile"][0]{), code:groq (*[_type == "profile"][0]{), Get main profile, Get profile with full bio, 👤 Profile Queries

### Community 76 - "Community 76"
Cohesion: 0.4
Nodes (5): code:groq (count(*)), code:groq ({), Count all documents, Count documents by type, 📊 Count & Statistics Queries

### Community 77 - "Community 77"
Cohesion: 0.4
Nodes (5): code:groq (*[_type == "experience" && current == true][0]{), code:groq (*[_type == "experience"] | order(startDate desc){), 🏢 Experience Queries, Get all work experience (newest first), Get current position

### Community 78 - "Community 78"
Cohesion: 0.4
Nodes (5): 🧹 Cleaning Up / Starting Fresh, code:bash (# ⚠️ WARNING: This deletes ALL documents in the dataset), code:groq (// In Vision tool, run this query to find documents), Delete All Data from a Dataset, Delete Specific Document Types

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (4): code:groq (// Count all documents), Method 1: Using Sanity Studio, Method 2: Using Vision (GROQ Playground), 🔍 Verify Import Success

## Knowledge Gaps
- **381 isolated node(s):** `csp`, `securityHeaders`, `ERRORS`, `labButton`, `chatInput` (+376 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 3` to `Community 1`, `Community 33`, `Community 35`, `Community 2`, `Community 4`, `Community 38`, `Community 34`, `Community 27`, `Community 10`, `Community 43`, `Community 17`, `Community 51`, `Community 23`, `Community 91`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `CometCard()` connect `Community 23` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 40`, `Community 44`, `Community 15`, `Community 49`, `Community 31`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useSidebar()` connect `Community 51` to `Community 33`, `Community 2`, `Community 1`, `Community 3`, `Community 38`, `Community 25`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `csp`, `securityHeaders`, `ERRORS` to the rest of the system?**
  _381 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._