/**
 * fixed-prompts.ts
 *
 * The 16 author-specified chip prompts across all 4 personas.
 * Each entry carries:
 *   - persona         — which persona this belongs to
 *   - promptText      — exact text the chip sends (used for matching)
 *   - navTarget       — deterministic navigation (never left to the model)
 *   - answerBrief     — guides the model's prose; NOT rendered verbatim
 *   - promptId        — stable cache key segment
 *
 * For fixed prompts the model receives the answerBrief injected into the
 * system prompt and the navTarget is injected as a hard directive, bypassing
 * the model's section-routing step entirely.  This kills the "everything
 * navigates to BOOM" bug.
 */

import type { Persona } from "@/lib/personas";

export type NavTarget = {
  sectionId:
    | "hero"
    | "about"
    | "experience"
    | "projects"
    | "skills"
    | "education"
    | "certifications"
    | "blog"
    | "contact";
  itemSlug?: string; // project slug — must match Sanity slug.current
  itemIndex?: number; // 0-based experience index
};

export type FixedPrompt = {
  persona: Persona;
  promptId: string;
  promptText: string;
  navTarget: NavTarget;
  answerBrief: string;
};

export const FIXED_PROMPTS: FixedPrompt[] = [
  // ── Friend ───────────────────────────────────────────────────────────────────
  {
    persona: "friend",
    promptId: "friend-excited",
    promptText: "What's Anant actually excited about?",
    navTarget: { sectionId: "about" },
    answerBrief:
      "Anant is genuinely excited about building things and working alongside high-functioning, ambitious people. He has worked with CFOs on his project ResQ — that kind of high-stakes collaboration energises him. He enjoys working with sharp individuals who move fast and build real things. Pull in whatever is relevant from the About Me section.",
  },
  {
    persona: "friend",
    promptId: "friend-orby",
    promptText: "What is Orby exactly?",
    navTarget: { sectionId: "about" },
    answerBrief:
      "This is Orby's hardest self-test. Reply in two parts: (1) 'Hi, I'm Orby. I wander this portfolio answering questions about Anant — his tiny astronaut buddy.' (2) 'The chatbot was my idea — Anant figured I alone wasn't enough to answer everything visitors would ask, so he built this platform you're talking to me on.' Stay in first-person Orby voice. Keep it warm and a little playful.",
  },
  {
    persona: "friend",
    promptId: "friend-vibecode",
    promptText: "Did Anant vibe code this portfolio?",
    navTarget: { sectionId: "about" },
    answerBrief:
      "The answer is NO, but be honest and funny about it. He architected and hand-built the bulk of this portfolio himself. The details that came from Claude were almost entirely rewritten each time. This chatbot is the main thing he has built and is still building — it was well thought through with Jarvis plus some AI help. It was not vibe coded. It was not a solo flex either. The Orby AI companion especially became a saga.",
  },
  {
    persona: "friend",
    promptId: "friend-techgeek",
    promptText: "What tech does he geek out on?",
    navTarget: { sectionId: "projects", itemSlug: "ai-market-analyzer" },
    answerBrief:
      "Open the TradingView project. His most infamous skills. He geeks out on building products that are suited to himself — solving real problems, starting with his own. Focused on creating tools that work for him first. Solves problems for the world but is currently laser-focused on solving his own problems first.",
  },

  // ── Recruiter ─────────────────────────────────────────────────────────────────
  {
    persona: "recruiter",
    promptId: "recruiter-skills",
    promptText: "What are his top skills?",
    navTarget: { sectionId: "skills" },
    answerBrief:
      "Summarise his top skills concisely with evidence from the catalog. Skills section renders as the proof pack. Already works well — stay evidence-led and concise. Include proficiency levels where available.",
  },
  {
    persona: "recruiter",
    promptId: "recruiter-project",
    promptText: "Show me his strongest project",
    navTarget: { sectionId: "projects", itemSlug: "boom" },
    answerBrief:
      "BOOM is his strongest project. Navigate to the BOOM project card. Include the live link for BOOM directly in the chat message if it is available in the catalog. Keep the description tight and evidence-led — what it is, what it does, why it is the strongest.",
  },
  {
    persona: "recruiter",
    promptId: "recruiter-impact",
    promptText: "Where has he had measurable impact?",
    navTarget: { sectionId: "experience", itemIndex: 1 },
    answerBrief:
      "Navigate to the NSP / NSEdu internship experience card. He worked on a real product with a real development team to build a fully functional website from scratch. Was provided with a Figma design and required to build it from scratch in 2 months. Focus on the tangible, measurable outcome — shipped a real product, real team, real deadline.",
  },
  {
    persona: "recruiter",
    promptId: "recruiter-timeline",
    promptText: "What's his experience timeline?",
    navTarget: { sectionId: "experience" },
    answerBrief:
      "2 years and ongoing. Building real products for about a year now. Just getting started on his journey building real solutions — the first year was figuring out what exactly is this new world he stepped into. Frame it as a trajectory that is accelerating, not just a list of dates.",
  },

  // ── CEO ───────────────────────────────────────────────────────────────────────
  {
    persona: "ceo",
    promptId: "ceo-trajectory",
    promptText: "What's Anant's trajectory?",
    navTarget: { sectionId: "about" },
    answerBrief:
      "Soon-to-be AI/ML engineer. Builds products, entrepreneur mindset. Might soon be in the same position as yourself — a CEO. Would love the opportunity to interact with people of your calibre. Builds projects and looks forward to selling them. Frame this as a founder-compatible trajectory, not just a career path.",
  },
  {
    persona: "ceo",
    promptId: "ceo-impact",
    promptText: "What's his highest-impact work?",
    navTarget: { sectionId: "projects", itemSlug: "jarvis-os" },
    answerBrief:
      "Navigate to the Jarvis project. CRITICAL: Do NOT frame Jarvis as a product to sell. Frame it as the second-brain system that helped Anant build everything else you see in this portfolio — a growing system, the bridge between AI and ideas, where all of his real innovation happens. This is the engine behind the work, not the work itself.",
  },
  {
    persona: "ceo",
    promptId: "ceo-5years",
    promptText: "Where is he headed in 5 years?",
    navTarget: { sectionId: "education" },
    answerBrief:
      "Headed toward a FAANG company or building his own startup — both trajectories are decided. In 2 years the 'startup' will no longer be a startup, it will be an MNC (if he builds one). If he does not, you might find him at companies you have dreamed of working at. Keep it confident and directional — this is a CEO audience.",
  },
  {
    persona: "ceo",
    promptId: "ceo-problems",
    promptText: "What problems is he solving?",
    navTarget: { sectionId: "blog" },
    answerBrief:
      "Check his GitHub for the full picture — the projects section does not explain it all. Mention SafeReach (disability disaster protocol), ResQ, and CasualOps as specific examples. Then note that even this does not cover everything he aims to solve. In the next version of this portfolio there will be a blog platform that explains in detail what he is working on and what he aims to solve. He also intends to write content without using AI — drop the dead internet theory here as a brief aside. Keep it high-signal.",
  },

  // ── Weirdo ────────────────────────────────────────────────────────────────────
  {
    persona: "weirdo",
    promptId: "weirdo-scifi",
    promptText: "Describe his stack as a sci-fi movie",
    navTarget: { sectionId: "skills" },
    answerBrief:
      "Open with 'What a funny question, here is my thought process:' then narrate the tech stack as a cinematic sci-fi movie. Make it genuinely interesting and fun. Every technology is a character or a spaceship or a plot device. Still grounded — only technologies that are actually in his catalog. Make it vivid.",
  },
  {
    persona: "weirdo",
    promptId: "weirdo-weird",
    promptText: "What's the weirdest thing he's built?",
    navTarget: { sectionId: "projects", itemSlug: "ai-market-analyzer" },
    answerBrief:
      "Navigate to the TradingView project — NOT BOOM. An AI that helps you trade is genuinely, wonderfully weird. Open with 'What a funny question, here is my thought process:' then explain why an AI trading assistant is such a bizarre and fascinating idea. Keep it grounded — only facts from the catalog. Make it fun.",
  },
  {
    persona: "weirdo",
    promptId: "weirdo-kafka",
    promptText: "Explain Kafka like he's a DJ",
    navTarget: { sectionId: "projects", itemSlug: "boom" },
    answerBrief:
      "Navigate to BOOM (which uses Kafka). Open with 'What a funny question, here is my thought process:' then explain Apache Kafka using the extended metaphor of a DJ and a club — messages are tracks, topics are decks, consumers are dancers, brokers are the soundboard. Make it vivid and accurate. Keep it grounded to what BOOM actually uses Kafka for.",
  },
  {
    persona: "weirdo",
    promptId: "weirdo-code-talks",
    promptText: "What would his code say if it could talk?",
    navTarget: { sectionId: "projects", itemSlug: "jarvis-os" },
    answerBrief:
      "Navigate to the Jarvis project. Open with 'What a funny question, here is my thought process:' then tell it as a short, quirky first-person story from the perspective of the code itself — what would it say, what would it complain about, what would it be proud of? Ground it in real tech from the catalog. Make it a story, not a list.",
  },
];

/**
 * Match a user message to a fixed prompt for a given persona.
 * Matching is case-insensitive and trims whitespace.
 */
export function findFixedPrompt(
  persona: Persona,
  userMessage: string,
): FixedPrompt | null {
  const normalised = userMessage.trim().toLowerCase();
  return (
    FIXED_PROMPTS.find(
      (fp) =>
        fp.persona === persona &&
        fp.promptText.trim().toLowerCase() === normalised,
    ) ?? null
  );
}
