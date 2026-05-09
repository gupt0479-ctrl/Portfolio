---
inclusion: fileMatch
fileMatchPattern: "src/sanity/**/*"
---

# Sanity Schema Reference

## Document Types & Their Schemas

### profile (singleton: `singleton-profile`)
Fields: firstName, lastName, headline, headlineStaticText, headlineAnimatedWords[], headlineAnimationDuration, shortBio, fullBio (Portable Text), profileImage, email, phone, location, availability (available|open|unavailable), socialLinks{github, linkedin, twitter, website, medium, devto, youtube, stackoverflow}, yearsOfExperience, stats[]{label, value}

### project
Fields: title, slug, tagline, coverImage, technologies[] → skill, category (web-app|mobile-app|ai-ml|api-backend|devops|open-source|cli-tool|desktop-app|browser-extension|game|other), liveUrl, githubUrl, visibility (featured|standard), order

### skill
Fields: name, category (frontend|backend|ai-ml|devops|database|mobile|cloud|testing|design|tools|soft-skills|other), proficiency (beginner|intermediate|advanced|expert), percentage, yearsOfExperience, tone (neutral|accent|highlight|muted)

### experience
Fields: company, position, employmentType (full-time|part-time|contract|freelance|internship), location, startDate, endDate, tenure (current|past), description (Portable Text), responsibilities[], achievements[], technologies[] → skill, companyLogo, companyWebsite, order

### education
Fields: institution, degree, fieldOfStudy, startDate, endDate, current, gpa, description, achievements[], logo, website, order

### certification
Fields: name, issuer, issueDate, expiryDate, credentialId, credentialUrl, logo, description, skills[] → skill, order

### achievement
Fields: title, type (award|hackathon|publication|speaking|open-source|milestone|recognition|other), issuer, date, description, image, url, featured, order

### blog
Fields: title, slug, excerpt, category, tags[], publishedAt, readTime, featuredImage, content (Portable Text)

### contact
Fields: name, email, subject, message, submittedAt, status (new|archived), notes

### siteSettings (singleton: `singleton-site-settings`)
Fields: siteTitle, siteDescription, siteLogo, showBlog

### navigation
Fields: title, href, icon, isExternal, linkType (internal|external), order

## GROQ Query Patterns
- Singletons: `coalesce(*[_type == "profile" && _id == "singleton-profile"][0], *[_type == "profile"][0])`
- References: `technologies[]->{ _id, name, category }`
- Ordering: `| order(order asc, startDate desc)`
- Computed fields: `"current": select(tenure == "current" => true, false)`
- Always use `defineQuery()` from `next-sanity` for type safety

## After Schema Changes
1. `pnpm typegen` — regenerate types
2. `pnpm typecheck` — verify
3. Update GROQ queries if fields changed
4. Never manually edit `src/sanity/types/index.ts`
