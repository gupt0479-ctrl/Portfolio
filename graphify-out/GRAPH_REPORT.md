# Graph Report - portfolio  (2026-05-09)

## Corpus Check
- 104 files · ~46,624 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 772 nodes · 1077 edges · 81 communities (67 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `14179529`
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
- [[_COMMUNITY_Community 72|Community 72]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 70 edges
2. `sanityFetch()` - 23 edges
3. `Data Overview` - 21 edges
4. `GROQ Query Examples` - 17 edges
5. `Sanity Portfolio Local Fallback Data` - 16 edges
6. `Sanity Portfolio Dummy Data` - 16 edges
7. `getLocalDataForQuery()` - 14 edges
8. `Orby / RB: Scroll Companion Concept` - 14 edges
9. `useSidebar()` - 13 edges
10. `📋 FILES UPDATED` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PortfolioContent()` --calls--> `sanityFetch()`  [EXTRACTED]
  src/components/PortfolioContent.tsx → src/sanity/lib/live.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/sheet.tsx → src/lib/utils.ts
- `Spinner()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/spinner.tsx → src/lib/utils.ts
- `Card()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Communities (81 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (31): ContactProfile, IridSocialButton(), SocialLinks, useIridescentEffect(), UseIridescentEffectOptions, formatCategory(), normalizeCategoryKey(), CTA_BUTTONS (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (30): cn(), Input(), Separator(), SheetHeader(), SheetTitle(), SidebarContext, SidebarContextProps, SidebarFooter() (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): 🏆 Achievements Data (7 achievements), 📝 Blog Posts Data (6 articles), 📜 Certifications Data (5 certifications), code:block1 (Profile), 📧 Contact Submissions Data (3 sample messages), Current Profile Snapshot, Data Overview, 🔗 Data Relationships (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): ABOUT_QUERYResult, ACHIEVEMENTS_QUERYResult, AllSanitySchemaTypes, BLOG_QUERYResult, CERTIFICATIONS_QUERYResult, CERTS_SECTION_QUERYResult, Contact, CONTACT_QUERYResult (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (13): submitContactForm(), client, builder, assertValue(), getServerClient(), ServerClient, token, serverClient (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (13): asRecord(), asString(), DATA_DIR, getLocalChatProfile, JsonRecord, normalizeProfileSocialLinks(), ProfileResult, readNdjsonFile (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (10): achievement, blog, contact, education, experience, navigation, profile, project (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (20): 10. **blog.ndjson**, 11. **profile-with-animation.ndjson**, 1. **profile.ndjson**, 2. **experience.ndjson**, 3. **skills.ndjson**, 4. **education.ndjson**, 5. **certifications.ndjson**, 6. **achievements.ndjson** (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (15): EvidenceCard(), EvidenceCardProps, MODE_DESCRIPTIONS, MODES, ProofPack(), ProofPackProps, EvidenceItem, generateProofPack() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (14): CORE_NAV, HeaderScrolling(), HeaderScrollingProps, NavItem, SECTION_IDS, useActiveSection(), useShowOnScroll(), Sheet() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (16): Authentication And Routing, Before Handing Off, Codex Project Skills And Hooks, Coding Standards, Commands, Content Flow, graphify, Known Risks And Gaps (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (16): Anant Gupta Portfolio, code:bash (pnpm install), code:bash (NEXT_PUBLIC_SANITY_PROJECT_ID=...), code:bash (pnpm dev), code:bash (pnpm typegen), code:bash (pnpm test), code:bash (bash codex/install-skills.sh), code:bash (bash codex/hooks/pre-task.sh) (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): 1. Local Character Animation, 2. Scroll-Progress Animation, Acceptance Criteria, Copy Bank, Current Portfolio Context, Experience Summary, Implementation Direction, Interaction Rules (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (7): useIsMobile(), CAM_END, CAM_START, Graph(), GraphProps, ObsidianBackground(), useReducedMotion()

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (12): BLOB_COLORS, BLOB_ICONS, BLOB_SIZES, BLOB_VARIANTS, BlobVariant, EducationFlowchart(), FlowchartItem, Props (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): ACHIEVEMENTS_QUERY, BLOG_QUERY, CERTIFICATIONS_QUERY, CHAT_PROFILE_QUERY, EDUCATION_QUERY, EXPERIENCE_QUERY, NAVIGATION_QUERY, PROJECTS_QUERY (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartLegendContentProps, ChartPayloadItem, ChartTooltipContent() (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.23
Nodes (10): ContactPanel(), hasUsableData(), live, loadLocalQueryResult(), sanityFetch(), ACHIEVEMENTS_SECTION_QUERY, AchievementsSection(), CONTACT_QUERY (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (12): code:groq (*[_type == "education"] | order(endDate desc){), code:groq (*[_type == "siteSettings"][0]{), code:groq (*[), 🎓 Education Queries, Get all education (newest first), Get site settings, GROQ Query Examples, 📚 Resources (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (12): getLocalAchievements, getLocalBlog, getLocalCertifications, getLocalContactProfile, getLocalDataForQuery(), getLocalEducation, getLocalExperience, getLocalNavigation (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.3
Nodes (11): 📚 Additional Resources, 📊 Data Statistics, ⚠️ Important: Singleton Documents, 🆘 Need Help?, 🎯 Next Steps After Import, 🖼️ Note About Images, 🔄 Order of Import (Important!), Sanity Portfolio Dummy Data (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (12): code:bash (npm install -g @sanity/cli), code:bash (# Check your .env.local file has:), code:bash (sanity login), code:bash (sanity dataset create production), code:bash (npm run typegen), Issue: "Authentication required", Issue: "Command not found: sanity", Issue: "Dataset not found" (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.2
Nodes (7): AboutTelemetry(), CANONICAL_READOUTS, CanonicalReadout, SPARKLINE_BARS, TelemetryCardProps, ABOUT_QUERY, AboutSection()

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (11): 📝 Blog Queries, code:groq (*[_type == "blog"] | order(publishedAt desc){), code:groq (*[_type == "blog" && featured == true] | order(publishedAt d), code:groq (*[_type == "blog" && slug.current == $slug][0]{), code:groq (*[_type == "blog" && category == "tutorial"] | order(publish), code:groq (*[_type == "blog" && "React" in tags] | order(publishedAt de), Get all blog posts (newest first), Get blog post by slug with full content (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (9): SidebarToggle(), PortfolioLab(), Sidebar(), SidebarContent(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger() (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (5): lora, metadata, ubuntu, AppSidebar(), ThemeProvider()

### Community 27 - "Community 27"
Cohesion: 0.24
Nodes (6): CertificationsSection(), CERTS_SECTION_QUERY, CertWithSkills, Certification, CometCard(), CometCardVariant

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (7): { container }, getGlareOverlay(), getInnerCard(), glare, inner, MotionDiv, React

### Community 29 - "Community 29"
Cohesion: 0.2
Nodes (10): code:env (NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id), code:bash (# Navigate to the Data folder), code:bash (# From the project root), code:bash (# From the Data folder), Environment Variables, Method 1: Import All Data at Once (Recommended), Method 2: Import Using One Command, Method 3: Import Specific Files Only (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.28
Nodes (5): BlogFeed(), PINNED_GITHUB, BLOG_SECTION_QUERY, BlogSection(), Blog

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (4): Footer(), PortfolioContent(), ObsidianBackground, NAVIGATION_QUERYResult

### Community 32 - "Community 32"
Cohesion: 0.28
Nodes (6): CATEGORY_COLORS, Experience, ExperienceCard(), ExperienceCardProps, ExperienceSection(), EXPERIENCE_QUERYResult

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (7): allFiles, BANNED_STRINGS, content, EXCLUDED_FILES, relativePath, srcDir, violations

### Community 34 - "Community 34"
Cohesion: 0.22
Nodes (7): content, idx, localContentSource, paddedCount, QUERY_TYPE_MAPPINGS, ROOT, sections

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (7): Architecture, Commands, Current Architecture, Files To Know, Key Patterns, Project Structure, Stack

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (9): code:groq (*[_type == "skill"] | order(order asc){), code:groq (*[_type == "skill" && featured == true] | order(order asc){), code:groq (*[_type == "skill" && category == "frontend"] | order(name a), code:groq ({), Get all skills, Get featured skills only, Get skills by category, Group skills by category (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (9): code:groq (*[_type == "project"] | order(order asc){), code:groq (*[_type == "project" && featured == true] | order(order asc)), code:groq (*[_type == "project" && slug.current == "ai-powered-content-), code:groq (*[_type == "project" && category == "ai-ml"]{), Get all projects, Get featured projects only, Get project by slug, Get projects by category (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (9): Basic Import (Replace Mode), code:bash (sanity dataset import <filename>.ndjson <dataset-name> --rep), code:bash (sanity dataset import <filename>.ndjson <dataset-name>), code:bash (# Import to development dataset), code:bash (sanity dataset import <filename>.ndjson <dataset-name> --mis), 📋 Import Command Options, Import to Different Dataset, Import Without Replacing (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (6): HeroTerminal(), ORBITING_CHIPS, TERMINAL_LINES, MotionDiv, MotionSpan, React

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (4): Button(), buttonVariants, LayoutTextFlip(), Spinner()

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (7): About page data, code:groq ({), code:groq ({), code:groq ({), 🎯 Combined / Complex Queries, Homepage data (everything you need for a homepage), Portfolio page data

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (7): code:groq (*[_type == "contact"] | order(submittedAt desc){), code:groq (*[_type == "contact" && status == "new"] | order(submittedAt), code:groq (*[_type == "contact" && priority == "high"] | order(submitte), 📧 Contact Queries, Get all contact submissions (newest first), Get high priority contacts, Get unread contacts

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (7): Animated Headline Feature, Before Importing, code:json ("siteTitle":"Anant Gupta - Portfolio" → "siteTitle":"Your Na), code:json ("firstName":"John" → "firstName":"YourName"), 🎨 Customizing the Data, Example: Updating Profile Data, Example: Updating Site Settings

### Community 45 - "Community 45"
Cohesion: 0.47
Nodes (5): clerk, config, event, isPublicRoute, proxy()

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (6): code:groq (*[_type == "blog" && slug.current == $slug][0]), code:groq (image{), code:groq (*[_type == "project"]{), code:groq (count(*[_type == "blog" && featured == true])), code:groq ({), 💡 Pro Tips

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (4): urlFor(), PROFILE_QUERY, HeroContent(), HeroSection()

### Community 48 - "Community 48"
Cohesion: 0.4
Nodes (4): amoebaIdx, content, formingIdx, stableIdx

### Community 50 - "Community 50"
Cohesion: 0.4
Nodes (5): 🏆 Achievements Queries, code:groq (*[_type == "achievement"] | order(date desc){), code:groq (*[_type == "achievement" && featured == true] | order(date d), Get all achievements (newest first), Get featured achievements

### Community 51 - "Community 51"
Cohesion: 0.4
Nodes (5): code:groq (*[_type == "profile"][0]{), code:groq (*[_type == "profile"][0]{), Get main profile, Get profile with full bio, 👤 Profile Queries

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (5): code:groq (count(*)), code:groq ({), Count all documents, Count documents by type, 📊 Count & Statistics Queries

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (5): 📜 Certifications Queries, code:groq (*[_type == "certification"] | order(issueDate desc){), code:groq (*[_type == "certification" && (expiryDate == null || expiryD), Get active certifications (not expired), Get all certifications (newest first)

### Community 54 - "Community 54"
Cohesion: 0.4
Nodes (5): code:groq (*[_type == "experience" && current == true][0]{), code:groq (*[_type == "experience"] | order(startDate desc){), 🏢 Experience Queries, Get all work experience (newest first), Get current position

### Community 55 - "Community 55"
Cohesion: 0.4
Nodes (5): 🧹 Cleaning Up / Starting Fresh, code:bash (# ⚠️ WARNING: This deletes ALL documents in the dataset), code:groq (// In Vision tool, run this query to find documents), Delete All Data from a Dataset, Delete Specific Document Types

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (3): config, isPublicRoute, isStudioRoute

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (4): code:groq (// Count all documents), Method 1: Using Sanity Studio, Method 2: Using Vision (GROQ Playground), 🔍 Verify Import Success

## Knowledge Gaps
- **306 isolated node(s):** `nextConfig`, `event`, `config`, `config`, `config` (+301 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 40`, `Community 41`, `Community 9`, `Community 13`, `Community 17`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `CometCard()` connect `Community 27` to `Community 0`, `Community 1`, `Community 32`, `Community 18`, `Community 28`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `nextConfig`, `event`, `config` to the rest of the system?**
  _306 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._