/**
 * degraded-responses.ts — static fallback answers for when all model
 * providers are exhausted.
 *
 * Each persona × intent combination has a pre-written reply that directs
 * the user to the relevant portfolio section without needing a live model.
 * Navigation intent is also detected here so the route can emit a nav
 * tool-result even in degraded mode.
 */

import type { Persona } from "@/lib/personas";

// ---------------------------------------------------------------------------
// Navigation intent → sectionId
// ---------------------------------------------------------------------------

const NAV_PATTERNS: Array<[RegExp, string]> = [
  [/project|portfolio|build|work|app/i, "projects"],
  [/experience|job|career|employer|company|work history/i, "experience"],
  [/skill|tech|stack|language|framework|tool/i, "skills"],
  [/education|school|university|degree|study|major/i, "education"],
  [/contact|hire|reach|email|connect|collaborate/i, "contact"],
  [/about|who|background|bio/i, "about"],
  [/cert|credential|license|certification/i, "certifications"],
  [/blog|article|post|writing/i, "blog"],
];

/**
 * Returns a sectionId if the user message clearly maps to a portfolio
 * section, or null if no match is found.
 */
export function getDegradedNavigation(userMessage: string): string | null {
  for (const [pattern, sectionId] of NAV_PATTERNS) {
    if (pattern.test(userMessage)) return sectionId;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Intent detection for response selection
// ---------------------------------------------------------------------------

type Intent =
  | "projects"
  | "experience"
  | "skills"
  | "education"
  | "contact"
  | "general";

function detectIntent(msg: string): Intent {
  if (/project|portfolio|build/i.test(msg)) return "projects";
  if (/experience|job|career/i.test(msg)) return "experience";
  if (/skill|tech|stack/i.test(msg)) return "skills";
  if (/education|school|degree/i.test(msg)) return "education";
  if (/contact|hire|reach/i.test(msg)) return "contact";
  return "general";
}

// ---------------------------------------------------------------------------
// Per-persona, per-intent response templates
// ---------------------------------------------------------------------------

type DegradedTemplates = Record<Intent, string>;

const TEMPLATES: Record<Persona, DegradedTemplates> = {
  friend: {
    projects:
      "Hey! My live brain is taking a quick nap, but Anant's projects are all right here on the page — scroll down to the Projects section and check them out. He's built some really cool stuff!",
    experience:
      "I'm offline for a sec, but Anant's full work history is in the Experience section below — you can read about everything from BOOM to TechLit there.",
    skills:
      "Taking a breather over here! Anant's full skills breakdown is in the Skills section — lots of cool stuff from Rust to LLM APIs.",
    education:
      "My circuits are resting, but Anant's education info is in the Education section below. University of Minnesota, Computer Science — good stuff.",
    contact:
      "I'm a bit offline right now, but the Contact section at the bottom of the page is the best way to get in touch with Anant!",
    general:
      "Heads up — I'm in low-power mode right now and can't generate a live response. Everything you need is on this page though. Try scrolling through the sections!",
  },
  recruiter: {
    projects:
      "I'm temporarily unavailable, but Anant's project portfolio is fully visible in the Projects section below. You'll find titles, technologies, and descriptions there.",
    experience:
      "Live responses are currently unavailable. For Anant's full work history and responsibilities, please see the Experience section below — it includes all roles and timelines.",
    skills:
      "I'm offline at the moment. Anant's complete skills and technology stack are documented in the Skills section. Please scroll down to review.",
    education:
      "Temporarily unavailable. Anant's educational background is in the Education section below — University of Minnesota, B.S. Computer Science.",
    contact:
      "I'm currently unavailable for live chat. To connect with Anant directly, please use the Contact section at the bottom of the page.",
    general:
      "I'm temporarily offline and unable to generate a response. All of Anant's professional information — experience, projects, skills — is available on this page. Please scroll to the relevant section.",
  },
  weirdo: {
    projects:
      "My neurons have gone on a coffee break. But the Projects section below holds the truth — compiled artifacts from Anant's dev dimension. Scroll, mortal.",
    experience:
      "The signal is weak from this side of the bandwidth. His career trajectory is inscribed in the Experience section — read the runes below.",
    skills:
      "Orby.exe has temporarily entered sleep mode. The Skills matrix below contains the full capability lattice. Read it. Understand it.",
    education:
      "The model sleeps but the knowledge endures. His origin story is in Education. Minnesota. CS. The beginning.",
    contact:
      "Transmission interrupted. To reach the human Anant, scroll to Contact. Leave a message in the void. He reads them.",
    general:
      "System: nominal. Consciousness: temporarily unavailable. The page below contains all truths. Scroll with purpose.",
  },
  ceo: {
    projects:
      "Offline. Project portfolio — Projects section. Full details there.",
    experience:
      "Unavailable. Work history is in the Experience section. Review it.",
    skills: "Down temporarily. Full stack and skills in the Skills section.",
    education: "Offline. Academic credentials in the Education section.",
    contact: "Unavailable. Contact form is at the bottom of the page.",
    general:
      "Temporarily offline. All relevant information is on this page. Scroll to the appropriate section.",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the pre-written degraded response for the given persona and
 * user message, selecting the best-matching intent template.
 */
export function getDegradedText(persona: Persona, userMessage: string): string {
  const intent = detectIntent(userMessage);
  return TEMPLATES[persona][intent];
}

// ---------------------------------------------------------------------------
// Degraded-mode orbyMessage — canned arrival lines per persona × section
// ---------------------------------------------------------------------------

const DEGRADED_ORBY_MESSAGES: Record<
  Persona,
  Partial<Record<string, string>>
> = {
  friend: {
    hero: "Welcome! This is where the journey starts.",
    about: "Here's the backstory — pretty cool origin story.",
    experience: "All the roles and adventures, right here.",
    projects: "These are some of Anant's proudest builds — dig in!",
    skills: "A whole stack of interesting stuff right here.",
    education: "Where it all started — University of Minnesota!",
    certifications: "Proof and credentials, neatly stacked.",
    blog: "Thoughts in progress — check back soon.",
    contact: "Reach out — he's genuinely good at getting back to people.",
  },
  recruiter: {
    hero: "Anant Gupta — AI and Data Systems Engineer.",
    about: "Professional background and summary.",
    experience: "Work history and responsibilities are documented here.",
    projects: "Project portfolio — deliverables and technology stack below.",
    skills: "Technical competencies — full stack and data systems.",
    education: "Academic credentials — University of Minnesota, CS.",
    certifications: "Verified credentials from recognized programs.",
    blog: "Published writing and technical notes.",
    contact: "Direct contact channel — response time is typically prompt.",
  },
  weirdo: {
    hero: "Entry point. You have arrived at the command center.",
    about: "The biography scroll. Know the lore.",
    experience: "The career timeline — read the runes.",
    projects: "The artifact archive. Inspect the constructs.",
    skills: "The capability lattice. Absorb the matrix.",
    education: "The origin planet. Where it all began.",
    certifications: "The credential vault. Verified truths.",
    blog: "Dispatches from the void. Thoughts made text.",
    contact: "The communication channel. Send your signal.",
  },
  ceo: {
    hero: "The overview. Start here.",
    about: "Background. Know who you're dealing with.",
    experience: "Track record. Each role, each outcome.",
    projects: "Portfolio. High-signal work, shipping velocity.",
    skills: "Capability stack. Breadth and depth both present.",
    education: "Foundation. Strong institutional base.",
    certifications: "Verified credentials.",
    blog: "Published thinking.",
    contact: "Direct line. Let's make it happen.",
  },
};

/**
 * Returns a canned Orby arrival line for degraded-mode navigation, or null
 * if no entry is defined for this persona/section combination.
 */
export function getDegradedOrbyMessage(
  persona: Persona,
  sectionId: string,
): string | null {
  return DEGRADED_ORBY_MESSAGES[persona]?.[sectionId] ?? null;
}
