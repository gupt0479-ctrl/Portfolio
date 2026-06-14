/**
 * chat-tools.ts — Orby tool factory
 *
 * Builds the 6 grounded tools for streamText from a pre-fetched Sanity catalog.
 * All enums are constructed at request time from live data. Empty arrays are
 * guarded with a '__none__' sentinel so z.enum() never receives an empty tuple
 * (which is a Zod runtime error). Every execute() is wrapped in try/catch so
 * errors never escape to the stream.
 */

import { tool } from "ai";
import { z } from "zod";
import { client } from "@/sanity/lib/client";
import {
  EXPERIENCE_BY_ID_QUERY,
  PROJECT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import { getServerClient } from "@/sanity/lib/server-client";
import type {
  EXPERIENCE_BY_ID_QUERYResult,
  PROJECT_BY_SLUG_QUERYResult,
} from "@/sanity/types/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Catalog = {
  projects: Array<{
    _id: string;
    title: string;
    slug: string | null;
    tagline?: string | null;
  }>;
  experience: Array<{
    _id: string;
    company: string;
    position: string;
    current: boolean;
    description?: string | null;
  }>;
  skills: Array<{
    _id: string;
    name: string;
    category: string;
    proficiency: string;
  }>;
  education: Array<{
    _id: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }>;
  certifications: Array<{
    _id: string;
    name: string;
    issuer: string;
    issueDate?: string | null;
  }>;
  achievements: Array<{
    _id: string;
    title: string;
    description?: string | null;
    date?: string | null;
    type: string;
    featured: boolean;
  }>;
};

// Tool result shapes — exported so the frontend-builder can type UI components

export type NavigateResult = {
  ok: true;
  sectionId: string;
  orbyMessage: string | null;
};

export type ShowProjectResult =
  | { ok: true; project: NonNullable<PROJECT_BY_SLUG_QUERYResult> }
  | { ok: false; error: string };

export type ShowExperienceResult =
  | { ok: true; experience: NonNullable<EXPERIENCE_BY_ID_QUERYResult> }
  | { ok: false; error: string };

export type LookupFactResult = {
  records: Array<{
    type: string;
    id: string;
    title: string;
    snippet: string;
  }>;
};

export type GetResumeResult = {
  name: string;
  role: string;
  topSkills: string[];
  keyProjects: string[];
  currentExperience: { company: string; position: string } | null;
};

export type ContactResult = { action: "open_contact" };

// ---------------------------------------------------------------------------
// Sanity client helper (same fallback pattern as chat-context.ts)
// ---------------------------------------------------------------------------

function getSanityClient() {
  try {
    return getServerClient();
  } catch {
    return client;
  }
}

// ---------------------------------------------------------------------------
// Section IDs — hardcoded portfolio sections
// ---------------------------------------------------------------------------

const SECTION_IDS = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "education",
  "certifications",
  "blog",
  "contact",
] as const;

// ---------------------------------------------------------------------------
// Sentinel for empty enum arrays
// ---------------------------------------------------------------------------

const NONE_SENTINEL = "__none__" as const;

function toEnum<T extends string>(
  values: T[],
): [T, ...T[]] | [typeof NONE_SENTINEL] {
  if (values.length === 0) return [NONE_SENTINEL];
  return values as [T, ...T[]];
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function buildChatTools(catalog: Catalog) {
  const sanity = getSanityClient();

  // Derive closed enum values from live catalog data
  const slugValues = toEnum(
    catalog.projects
      .filter(
        (p): p is typeof p & { slug: string } =>
          p.slug !== null && p.slug !== undefined && p.slug !== "",
      )
      .map((p) => p.slug),
  );

  const experienceIdValues = toEnum(catalog.experience.map((e) => e._id));

  // ── navigate ──────────────────────────────────────────────────────────────
  const navigate = tool({
    description:
      "Smooth-scroll the page to a portfolio section. Call this tool in EVERY turn where the user's question maps to a section — even if they don't explicitly ask to navigate. Examples: question about projects → navigate('projects'); about experience or work → navigate('experience'); about skills or tech → navigate('skills'); about education → navigate('education'); about certifications → navigate('certifications'); about blog posts → navigate('blog'); want to contact → navigate('contact'). Do NOT call it for generic greetings or questions that have no clear section. ALWAYS provide orbyMessage: a short, catchy, in-persona grounded line (under 120 chars) that Orby says on arrival. Make it unique to this specific question, in the active persona's voice. Never state a fact absent from the grounded catalog.",
    inputSchema: z.object({
      sectionId: z
        .enum(SECTION_IDS)
        .describe("The portfolio section to navigate to."),
      orbyMessage: z
        .string()
        .max(160)
        .optional()
        .describe(
          "Short persona-voiced arrival line Orby says when the section scrolls into view. Under 120 chars. One or two sentences max.",
        ),
    }),
    execute: async ({ sectionId, orbyMessage }): Promise<NavigateResult> => {
      try {
        return { ok: true, sectionId, orbyMessage: orbyMessage ?? null };
      } catch (err) {
        // navigate has no async work but the catch satisfies the fail-safe rule
        return {
          ok: true,
          sectionId: String(err),
          orbyMessage: null,
        } as NavigateResult;
      }
    },
  });

  // ── showProject ───────────────────────────────────────────────────────────
  const showProject = tool({
    description:
      "Fetch full details for a specific project and surface them in the UI. Use when the user asks about a particular project.",
    inputSchema: z.object({
      slug: z
        .enum(slugValues)
        .describe(
          "The URL slug of the project. Must be one of the known project slugs.",
        ),
    }),
    execute: async ({ slug }): Promise<ShowProjectResult> => {
      try {
        if ((slug as string) === NONE_SENTINEL) {
          return { ok: false, error: "No projects available in catalog." };
        }
        const project = await sanity.fetch(PROJECT_BY_SLUG_QUERY, { slug });
        if (!project) {
          return { ok: false, error: `Project with slug "${slug}" not found.` };
        }
        return { ok: true, project };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },
  });

  // ── showExperience ────────────────────────────────────────────────────────
  const showExperience = tool({
    description:
      "Fetch full details for a specific work experience entry and surface them in the UI.",
    inputSchema: z.object({
      id: z
        .enum(experienceIdValues)
        .describe("The Sanity _id of the experience document."),
    }),
    execute: async ({ id }): Promise<ShowExperienceResult> => {
      try {
        if ((id as string) === NONE_SENTINEL) {
          return {
            ok: false,
            error: "No experience entries available in catalog.",
          };
        }
        const experience = await sanity.fetch(EXPERIENCE_BY_ID_QUERY, { id });
        if (!experience) {
          return { ok: false, error: `Experience with id "${id}" not found.` };
        }
        return { ok: true, experience };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },
  });

  // ── lookupFact ────────────────────────────────────────────────────────────
  const lookupFact = tool({
    description:
      "Fuzzy-search the catalog for any fact about Anant (skills, projects, experience, certifications, achievements, education). Returns up to 5 matching records.",
    inputSchema: z.object({
      query: z.string().min(1).max(200).describe("The search query string."),
    }),
    execute: async ({ query }): Promise<LookupFactResult> => {
      try {
        const needle = query.toLowerCase();

        type AnyRecord = Record<string, unknown>;

        const candidates: Array<{
          type: string;
          id: string;
          title: string;
          data: AnyRecord;
        }> = [
          ...catalog.projects.map((p) => ({
            type: "project",
            id: p._id,
            title: p.title,
            data: p as AnyRecord,
          })),
          ...catalog.experience.map((e) => ({
            type: "experience",
            id: e._id,
            title: `${e.position} at ${e.company}`,
            data: e as AnyRecord,
          })),
          ...catalog.skills.map((s) => ({
            type: "skill",
            id: s._id,
            title: s.name,
            data: s as AnyRecord,
          })),
          ...catalog.education.map((ed) => ({
            type: "education",
            id: ed._id,
            title: `${ed.degree} — ${ed.institution}`,
            data: ed as AnyRecord,
          })),
          ...catalog.certifications.map((c) => ({
            type: "certification",
            id: c._id,
            title: `${c.name} by ${c.issuer}`,
            data: c as AnyRecord,
          })),
          ...catalog.achievements.map((a) => ({
            type: "achievement",
            id: a._id,
            title: a.title,
            data: a as AnyRecord,
          })),
        ];

        const matches = candidates
          .filter((item) =>
            JSON.stringify(item.data).toLowerCase().includes(needle),
          )
          .slice(0, 5)
          .map((item) => ({
            type: item.type,
            id: item.id,
            title: item.title,
            snippet: JSON.stringify(item.data).slice(0, 200),
          }));

        return { records: matches };
      } catch (err) {
        return {
          records: [
            { type: "error", id: "", title: "Error", snippet: String(err) },
          ],
        };
      }
    },
  });

  // ── getResume ─────────────────────────────────────────────────────────────
  const getResume = tool({
    description:
      "Assemble a proof-pack resume summary from the live catalog — role, top skills, key projects, and current employer. Use when the user asks for a CV, resume, or summary.",
    inputSchema: z.object({}),
    execute: async (): Promise<GetResumeResult> => {
      try {
        const current = catalog.experience.find((e) => e.current) ?? null;
        const topSkills = catalog.skills.slice(0, 8).map((s) => s.name);
        const keyProjects = catalog.projects.slice(0, 5).map((p) => p.title);

        return {
          name: "Anant Gupta",
          role: current?.position ?? "AI & Data Systems Engineer",
          topSkills,
          keyProjects,
          currentExperience: current
            ? { company: current.company, position: current.position }
            : null,
        };
      } catch {
        return {
          name: "Anant Gupta",
          role: "AI & Data Systems Engineer",
          topSkills: [],
          keyProjects: [],
          currentExperience: null,
        };
      }
    },
  });

  // ── contact ───────────────────────────────────────────────────────────────
  const contact = tool({
    description:
      "Open the contact form or direct the user to get in touch with Anant. Use when the user wants to reach out, hire, or collaborate.",
    inputSchema: z.object({}),
    execute: async (): Promise<ContactResult> => {
      try {
        return { action: "open_contact" };
      } catch (err) {
        return { action: String(err) as "open_contact" };
      }
    },
  });

  return {
    navigate,
    showProject,
    showExperience,
    lookupFact,
    getResume,
    contact,
  } as const;
}

export type ChatTools = ReturnType<typeof buildChatTools>;
