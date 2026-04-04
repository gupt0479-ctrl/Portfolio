import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type {
  ACHIEVEMENTS_SECTION_QUERYResult,
  BLOG_SECTION_QUERYResult,
  CERTS_SECTION_QUERYResult,
  CHAT_PROFILE_QUERYResult,
  CONTACT_QUERYResult,
  EDUCATION_SECTION_QUERYResult,
  EXPERIENCE_QUERYResult,
  FOOTER_QUERYResult,
  NAVIGATION_QUERYResult,
  PROFILE_QUERYResult,
  PROJECTS_QUERYResult,
  SITE_SETTINGS_QUERYResult,
  SKILLS_QUERYResult,
} from "@/sanity/types";

type JsonRecord = Record<string, unknown>;
type ProfileResult = NonNullable<PROFILE_QUERYResult>;
type OptionalSocialLinks = NonNullable<FOOTER_QUERYResult>["socialLinks"];

const DATA_DIR = path.join(process.cwd(), "Data");

const SKILL_NAME_OVERRIDES: Record<string, string> = {
  ai: "AI",
  aws: "AWS",
  css: "CSS",
  docker: "Docker",
  git: "Git",
  html: "HTML",
  javascript: "JavaScript",
  llm: "LLM",
  mongodb: "MongoDB",
  nextjs: "Next.js",
  nodejs: "Node.js",
  openai: "OpenAI",
  postgresql: "PostgreSQL",
  react: "React",
  redis: "Redis",
  typescript: "TypeScript",
  vercel: "Vercel",
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );

  return items.length ? items : [];
}

function isNonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function normalizePortableText(value: unknown) {
  if (!Array.isArray(value)) return null;

  return value
    .map((block, blockIndex) => {
      const blockRecord = asRecord(block);
      if (!blockRecord) return null;

      const children = Array.isArray(blockRecord.children)
        ? blockRecord.children
            .map((child, childIndex) => {
              const childRecord = asRecord(child);
              if (!childRecord) return null;

              return {
                ...childRecord,
                _key:
                  asString(childRecord._key) ??
                  `child-${blockIndex}-${childIndex}`,
              };
            })
            .filter(isNonNullable)
        : [];

      const markDefs = Array.isArray(blockRecord.markDefs)
        ? blockRecord.markDefs
            .map((markDef, markIndex) => {
              const markDefRecord = asRecord(markDef);
              if (!markDefRecord) return null;

              return {
                ...markDefRecord,
                _key:
                  asString(markDefRecord._key) ??
                  `mark-${blockIndex}-${markIndex}`,
              };
            })
            .filter(isNonNullable)
        : [];

      return {
        ...blockRecord,
        _key: asString(blockRecord._key) ?? `block-${blockIndex}`,
        children,
        markDefs,
      };
    })
    .filter(isNonNullable) as ProfileResult["fullBio"];
}

function normalizeStats(value: unknown) {
  if (!Array.isArray(value)) return null;

  return value
    .map((stat, index) => {
      const statRecord = asRecord(stat);
      if (!statRecord) return null;

      return {
        label: asString(statRecord.label),
        value: asString(statRecord.value),
        _key: asString(statRecord._key) ?? `stat-${index}`,
      };
    })
    .filter(isNonNullable) as ProfileResult["stats"];
}

function normalizeProfileSocialLinks(
  value: unknown,
): ProfileResult["socialLinks"] {
  const socialLinks = asRecord(value);
  if (!socialLinks) return null;

  return {
    github: asString(socialLinks.github),
    linkedin: asString(socialLinks.linkedin),
    twitter: asString(socialLinks.twitter),
    website: asString(socialLinks.website),
    medium: asString(socialLinks.medium),
    devto: asString(socialLinks.devto),
    youtube: asString(socialLinks.youtube),
    stackoverflow: asString(socialLinks.stackoverflow),
  };
}

function toOptionalSocialLinks(
  value: ProfileResult["socialLinks"],
): OptionalSocialLinks {
  if (!value) return null;

  return {
    github: value.github ?? undefined,
    linkedin: value.linkedin ?? undefined,
    twitter: value.twitter ?? undefined,
    website: value.website ?? undefined,
    medium: value.medium ?? undefined,
    devto: value.devto ?? undefined,
    youtube: value.youtube ?? undefined,
    stackoverflow: value.stackoverflow ?? undefined,
  };
}

function humanizeSkillRef(ref: string) {
  return ref
    .replace(/^skill-/, "")
    .split("-")
    .map((part) => SKILL_NAME_OVERRIDES[part] ?? capitalize(part))
    .join(" ");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const readNdjsonFile = cache(
  async (filename: string): Promise<JsonRecord[]> => {
    try {
      const file = await fs.readFile(path.join(DATA_DIR, filename), "utf8");

      return file
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line) as JsonRecord);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }

      throw error;
    }
  },
);

export const getLocalProfile = cache(async (): Promise<PROFILE_QUERYResult> => {
  const [profile] = await readNdjsonFile("profile.ndjson");
  if (!profile) return null;

  const normalizedProfile = {
    _id: asString(profile._id) ?? "singleton-profile",
    firstName: asString(profile.firstName),
    lastName: asString(profile.lastName),
    headline: asString(profile.headline),
    headlineStaticText: asString(profile.headlineStaticText),
    headlineAnimatedWords: asStringArray(profile.headlineAnimatedWords),
    headlineAnimationDuration: asNumber(profile.headlineAnimationDuration),
    shortBio: asString(profile.shortBio),
    fullBio: normalizePortableText(profile.fullBio),
    profileImage: null,
    email: asString(profile.email),
    phone: asString(profile.phone),
    location: asString(profile.location),
    availability:
      (asString(profile.availability) as ProfileResult["availability"]) ?? null,
    socialLinks: normalizeProfileSocialLinks(profile.socialLinks),
    yearsOfExperience: asNumber(profile.yearsOfExperience),
    stats: normalizeStats(profile.stats),
  };

  return normalizedProfile as PROFILE_QUERYResult;
});

export const getLocalChatProfile = cache(
  async (): Promise<CHAT_PROFILE_QUERYResult> => {
    const profile = await getLocalProfile();
    if (!profile) return null;

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      headline: profile.headline,
    };
  },
);

export const getLocalFooterProfile = cache(
  async (): Promise<FOOTER_QUERYResult> => {
    const profile = await getLocalProfile();
    if (!profile) return null;

    return {
      email: profile.email,
      socialLinks: toOptionalSocialLinks(profile.socialLinks),
    };
  },
);

export const getLocalContactProfile = cache(
  async (): Promise<CONTACT_QUERYResult> => {
    const profile = await getLocalProfile();
    if (!profile) return null;

    return {
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      socialLinks: toOptionalSocialLinks(profile.socialLinks),
    };
  },
);

export const getLocalSiteSettings = cache(
  async (): Promise<SITE_SETTINGS_QUERYResult> => {
    const [settings] = await readNdjsonFile("siteSettings.ndjson");
    if (!settings) return null;

    return {
      _id: asString(settings._id) ?? "singleton-siteSettings",
      siteTitle: asString(settings.siteTitle),
      siteDescription: asString(settings.siteDescription),
      siteLogo: null,
      showBlog: asBoolean(settings.showBlog),
      _createdAt: "",
      _updatedAt: "",
    };
  },
);

export const getLocalSkills = cache(async (): Promise<SKILLS_QUERYResult> => {
  const skills = await readNdjsonFile("skills.ndjson");

  return skills
    .map((skill) => ({
      _id: asString(skill._id) ?? "",
      name: asString(skill.name),
      category:
        (asString(skill.category) as SKILLS_QUERYResult[number]["category"]) ??
        null,
      proficiency:
        (asString(
          skill.proficiency,
        ) as SKILLS_QUERYResult[number]["proficiency"]) ?? null,
      percentage: asNumber(skill.percentage),
      yearsOfExperience: asNumber(skill.yearsOfExperience),
      tone:
        (asString(skill.tone) as SKILLS_QUERYResult[number]["tone"]) ??
        "neutral",
    }))
    .filter((skill) => skill._id)
    .sort((left, right) => {
      const categoryCompare = (left.category ?? "").localeCompare(
        right.category ?? "",
      );
      if (categoryCompare !== 0) return categoryCompare;
      return (left.name ?? "").localeCompare(right.name ?? "");
    });
});

function resolveSkillReferences(refs: unknown, skills: SKILLS_QUERYResult) {
  if (!Array.isArray(refs)) return [];

  const skillsById = new Map(skills.map((skill) => [skill._id, skill]));

  return refs
    .map((ref) => {
      const refRecord = asRecord(ref);
      const refId = refRecord ? asString(refRecord._ref) : null;
      if (!refId) return null;

      return (
        skillsById.get(refId) ?? {
          _id: refId,
          name: humanizeSkillRef(refId),
          category: null,
          proficiency: null,
          percentage: null,
          yearsOfExperience: null,
          tone: "neutral" as const,
        }
      );
    })
    .filter(isNonNullable) as NonNullable<
    PROJECTS_QUERYResult[number]["technologies"]
  >;
}

export const getLocalNavigation = cache(
  async (): Promise<NAVIGATION_QUERYResult> => {
    const items = await readNdjsonFile("navigation.ndjson");

    return items
      .map((item) => ({
        _id: asString(item._id) ?? "",
        title: asString(item.title),
        href: asString(item.href),
        icon: asString(item.icon),
        isExternal: asBoolean(item.isExternal) ?? false,
        order: asNumber(item.order),
      }))
      .filter((item) => item._id)
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  },
);

export const getLocalProjects = cache(
  async (): Promise<PROJECTS_QUERYResult> => {
    const [projects, skills] = await Promise.all([
      readNdjsonFile("projects.ndjson"),
      getLocalSkills(),
    ]);

    const normalizedProjects = projects
      .map((project) => {
        const featured =
          asBoolean(project.featured) ??
          asString(project.visibility) === "featured";

        return {
          _id: asString(project._id) ?? "",
          title: asString(project.title),
          slug: asRecord(project.slug)
            ? {
                _type: "slug" as const,
                current: asString(asRecord(project.slug)?.current),
              }
            : null,
          tagline: asString(project.tagline),
          coverImage: null,
          technologies: resolveSkillReferences(project.technologies, skills),
          category:
            (asString(
              project.category,
            ) as PROJECTS_QUERYResult[number]["category"]) ?? null,
          liveUrl: asString(project.liveUrl),
          githubUrl: asString(project.githubUrl),
          featured,
          visibility:
            (asString(
              project.visibility,
            ) as PROJECTS_QUERYResult[number]["visibility"]) ??
            (featured ? "featured" : "standard"),
          order: asNumber(project.order),
        };
      })
      .filter((project) => project._id)
      .sort((left, right) => {
        const featuredCompare = Number(right.featured) - Number(left.featured);
        if (featuredCompare !== 0) return featuredCompare;
        return (left.order ?? 0) - (right.order ?? 0);
      });

    return normalizedProjects as PROJECTS_QUERYResult;
  },
);

export const getLocalExperience = cache(
  async (): Promise<EXPERIENCE_QUERYResult> => {
    const [items, skills] = await Promise.all([
      readNdjsonFile("experience.ndjson"),
      getLocalSkills(),
    ]);

    const normalizedExperience = items
      .map((item) => {
        const current =
          asBoolean(item.current) ?? asString(item.tenure) === "current";

        return {
          _id: asString(item._id) ?? "",
          company: asString(item.company),
          position: asString(item.position),
          employmentType:
            (asString(
              item.employmentType,
            ) as EXPERIENCE_QUERYResult[number]["employmentType"]) ?? null,
          location: asString(item.location),
          startDate: asString(item.startDate),
          endDate: asString(item.endDate),
          current,
          tenure:
            (asString(
              item.tenure,
            ) as EXPERIENCE_QUERYResult[number]["tenure"]) ??
            (current ? "current" : "past"),
          description: normalizePortableText(item.description),
          responsibilities: asStringArray(item.responsibilities),
          achievements: asStringArray(item.achievements),
          technologies: resolveSkillReferences(item.technologies, skills),
          companyLogo: null,
          companyWebsite: asString(item.companyWebsite),
          order: asNumber(item.order),
        };
      })
      .filter((item) => item._id)
      .sort((left, right) => {
        const orderCompare = (left.order ?? 0) - (right.order ?? 0);
        if (orderCompare !== 0) return orderCompare;
        return (right.startDate ?? "").localeCompare(left.startDate ?? "");
      });

    return normalizedExperience as EXPERIENCE_QUERYResult;
  },
);

export const getLocalEducation = cache(
  async (): Promise<EDUCATION_SECTION_QUERYResult> => {
    const items = await readNdjsonFile("education.ndjson");

    return items
      .map((item) => ({
        _id: asString(item._id) ?? "",
        institution: asString(item.institution),
        degree: asString(item.degree),
        fieldOfStudy: asString(item.fieldOfStudy),
        startDate: asString(item.startDate),
        endDate: asString(item.endDate),
        current: asBoolean(item.current),
        description: asString(item.description),
        gpa: asString(item.gpa),
      }))
      .filter((item) => item._id)
      .sort((left, right) =>
        (right.startDate ?? "").localeCompare(left.startDate ?? ""),
      );
  },
);

export const getLocalCertifications = cache(
  async (): Promise<CERTS_SECTION_QUERYResult> => {
    const items = await readNdjsonFile("certifications.ndjson");

    const normalizedCertifications = items
      .map((item) => ({
        _id: asString(item._id) ?? "",
        name: asString(item.name),
        issuer: asString(item.issuer),
        issueDate: asString(item.issueDate),
        credentialId: asString(item.credentialId),
        credentialUrl: asString(item.credentialUrl),
        logo: null,
      }))
      .filter((item) => item._id)
      .sort((left, right) =>
        (right.issueDate ?? "").localeCompare(left.issueDate ?? ""),
      );

    return normalizedCertifications as CERTS_SECTION_QUERYResult;
  },
);

export const getLocalAchievements = cache(
  async (): Promise<ACHIEVEMENTS_SECTION_QUERYResult> => {
    const items = await readNdjsonFile("achievements.ndjson");

    const normalizedAchievements = items
      .map((item) => ({
        _id: asString(item._id) ?? "",
        title: asString(item.title),
        description: asString(item.description),
        date: asString(item.date),
        type:
          (asString(
            item.type,
          ) as ACHIEVEMENTS_SECTION_QUERYResult[number]["type"]) ?? null,
        featured: asBoolean(item.featured),
      }))
      .filter((item) => item._id)
      .sort((left, right) => (right.date ?? "").localeCompare(left.date ?? ""));

    return normalizedAchievements as ACHIEVEMENTS_SECTION_QUERYResult;
  },
);

export const getLocalBlog = cache(
  async (): Promise<BLOG_SECTION_QUERYResult> => {
    const items = await readNdjsonFile("blog.ndjson");

    const normalizedBlog = items
      .map((item) => ({
        _id: asString(item._id) ?? "",
        title: asString(item.title),
        slug: asRecord(item.slug)
          ? {
              _type: "slug" as const,
              current: asString(asRecord(item.slug)?.current),
            }
          : null,
        excerpt: asString(item.excerpt),
        publishedAt: asString(item.publishedAt),
        readTime: asNumber(item.readTime),
        category: asString(item.category),
        featuredImage: null,
      }))
      .filter((item) => item._id)
      .sort((left, right) =>
        (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""),
      )
      .slice(0, 6);

    return normalizedBlog as BLOG_SECTION_QUERYResult;
  },
);

export async function getLocalDataForQuery(query: string) {
  if (query.includes('_type == "profile"')) return getLocalProfile();
  if (query.includes('_type == "siteSettings"')) return getLocalSiteSettings();
  if (query.includes('_type == "navigation"')) return getLocalNavigation();
  if (query.includes('_type == "project"')) return getLocalProjects();
  if (query.includes('_type == "skill"')) return getLocalSkills();
  if (query.includes('_type == "experience"')) return getLocalExperience();
  if (query.includes('_type == "education"')) return getLocalEducation();
  if (query.includes('_type == "certification"'))
    return getLocalCertifications();
  if (query.includes('_type == "achievement"')) return getLocalAchievements();
  if (query.includes('_type == "blog"')) return getLocalBlog();

  return undefined;
}
