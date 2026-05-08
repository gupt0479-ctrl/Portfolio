// src/lib/lab-data.ts

export type LabMode = "Recruiter" | "Builder" | "Research" | "Skeptic";

export interface LabChip {
  id: string;
  label: string;
  responseKey: string;
}

export interface EvidenceItem {
  title: string;
  description: string;
  sectionLink?: string; // e.g., "#experience", "#skills"
  tags: string[];
  sourceUrl?: string;
}

export interface LabResponse {
  heading: string;
  summary: string;
  evidence: EvidenceItem[];
}

// Suggested chips per mode
export const LAB_CHIPS: Record<LabMode, LabChip[]> = {
  Recruiter: [
    { id: "r1", label: "What's your stack?", responseKey: "recruiter-stack" },
    { id: "r2", label: "Any production experience?", responseKey: "recruiter-production" },
    { id: "r3", label: "Open to internships?", responseKey: "recruiter-internship" },
    { id: "r4", label: "What makes you different?", responseKey: "recruiter-differentiator" },
  ],
  Builder: [
    { id: "b1", label: "What are you building?", responseKey: "builder-current" },
    { id: "b2", label: "Favorite tech decisions?", responseKey: "builder-decisions" },
    { id: "b3", label: "Open source contributions?", responseKey: "builder-oss" },
    { id: "b4", label: "How do you approach system design?", responseKey: "builder-design" },
  ],
  Research: [
    { id: "rs1", label: "AI/ML interests?", responseKey: "research-ai" },
    { id: "rs2", label: "Data systems work?", responseKey: "research-data" },
    { id: "rs3", label: "What papers do you follow?", responseKey: "research-papers" },
    { id: "rs4", label: "Research projects?", responseKey: "research-projects" },
  ],
  Skeptic: [
    { id: "sk1", label: "Prove you can ship.", responseKey: "skeptic-ship" },
    { id: "sk2", label: "What have you actually built?", responseKey: "skeptic-built" },
    { id: "sk3", label: "Any real-world impact?", responseKey: "skeptic-impact" },
    { id: "sk4", label: "Why should I care?", responseKey: "skeptic-why" },
  ],
};

// Static deterministic responses
export const LAB_RESPONSES: Record<string, LabResponse> = {
  "recruiter-stack": {
    heading: "Core Stack",
    summary: "Full-stack with a focus on TypeScript, Next.js, and Python for AI/data work. Comfortable across the entire stack from database to UI.",
    evidence: [
      {
        title: "Frontend",
        description: "Next.js 16, React 19, Tailwind CSS v4, Three.js for 3D",
        sectionLink: "#skills",
        tags: ["Next.js", "React", "TypeScript"],
      },
      {
        title: "Backend & Data",
        description: "Node.js, Python, PostgreSQL, Redis, REST/GraphQL APIs",
        sectionLink: "#skills",
        tags: ["Python", "PostgreSQL", "Node.js"],
      },
      {
        title: "AI/ML",
        description: "LLM APIs, embeddings, RAG pipelines, prompt engineering",
        sectionLink: "#skills",
        tags: ["LLMs", "Python", "Embeddings"],
      },
    ],
  },
  "recruiter-production": {
    heading: "Production Experience",
    summary: "Shipped features used by real users across internships and personal projects. Experience with deployment, monitoring, and iterating on live systems.",
    evidence: [
      {
        title: "Work Experience",
        description: "Multiple internships with production deployments and real user impact",
        sectionLink: "#experience",
        tags: ["Production", "Internship"],
      },
      {
        title: "Live Projects",
        description: "Personal projects deployed and actively maintained",
        sectionLink: "#projects",
        tags: ["Deployed", "Live"],
      },
    ],
  },
  "recruiter-internship": {
    heading: "Internship Availability",
    summary: "Actively seeking internship opportunities in software engineering, AI/ML, or data systems. Available for summer and co-op positions.",
    evidence: [
      {
        title: "Contact",
        description: "Reach out directly to discuss opportunities",
        sectionLink: "#contact",
        tags: ["Available", "Open to Work"],
      },
    ],
  },
  "recruiter-differentiator": {
    heading: "What Sets Me Apart",
    summary: "Combination of strong systems thinking, AI/data expertise, and the ability to ship polished UIs. I build end-to-end, not just one layer.",
    evidence: [
      {
        title: "Full-Stack + AI",
        description: "Rare combination of frontend polish and backend/AI depth",
        sectionLink: "#skills",
        tags: ["Full-Stack", "AI/ML"],
      },
      {
        title: "Shipped Projects",
        description: "Portfolio of real projects, not just tutorials",
        sectionLink: "#projects",
        tags: ["Projects", "Shipped"],
      },
    ],
  },
  "builder-current": {
    heading: "Current Work",
    summary: "Building AI-powered tools, data pipelines, and this portfolio. Always have 2-3 projects in flight.",
    evidence: [
      {
        title: "Active Projects",
        description: "Check the projects section for what's currently live",
        sectionLink: "#projects",
        tags: ["Active", "Building"],
      },
    ],
  },
  "builder-decisions": {
    heading: "Favorite Tech Decisions",
    summary: "Choosing Rust for performance-critical paths, TypeScript everywhere for safety, and Postgres as the default database. Boring tech for boring problems, interesting tech for interesting ones.",
    evidence: [
      {
        title: "Rust for Performance",
        description: "Using Rust where latency and memory matter",
        sectionLink: "#skills",
        tags: ["Rust", "Performance"],
      },
      {
        title: "TypeScript First",
        description: "Type safety across the entire stack",
        sectionLink: "#skills",
        tags: ["TypeScript", "Safety"],
      },
    ],
  },
  "builder-oss": {
    heading: "Open Source",
    summary: "Contributions to open source projects and public repositories. Check GitHub for the full picture.",
    evidence: [
      {
        title: "GitHub",
        description: "Public repositories and contributions",
        sectionLink: "#blog",
        tags: ["Open Source", "GitHub"],
      },
    ],
  },
  "builder-design": {
    heading: "System Design Approach",
    summary: "Start with data models, define clear interfaces, then build outward. Prefer simple solutions that can scale over complex ones that can't be maintained.",
    evidence: [
      {
        title: "Experience",
        description: "System design decisions documented in work experience",
        sectionLink: "#experience",
        tags: ["Architecture", "Design"],
      },
    ],
  },
  "research-ai": {
    heading: "AI/ML Interests",
    summary: "Focused on LLMs, retrieval-augmented generation, and agent architectures. Interested in making AI systems more reliable and interpretable.",
    evidence: [
      {
        title: "AI/ML Skills",
        description: "LLM APIs, embeddings, RAG, prompt engineering",
        sectionLink: "#skills",
        tags: ["LLMs", "RAG", "Agents"],
      },
    ],
  },
  "research-data": {
    heading: "Data Systems",
    summary: "Experience with data pipelines, vector databases, and analytics. Interested in the intersection of data engineering and AI.",
    evidence: [
      {
        title: "Data Skills",
        description: "PostgreSQL, Redis, vector databases, data pipelines",
        sectionLink: "#skills",
        tags: ["Data", "Pipelines", "Databases"],
      },
    ],
  },
  "research-papers": {
    heading: "Research Following",
    summary: "Following work on LLM reasoning, retrieval systems, and efficient inference. Keeping up with Anthropic, DeepMind, and academic ML venues.",
    evidence: [
      {
        title: "Reading List",
        description: "Resources and papers tracked in the blog section",
        sectionLink: "#blog",
        tags: ["Research", "Papers"],
      },
    ],
  },
  "research-projects": {
    heading: "Research Projects",
    summary: "Applied research projects combining ML with real-world systems. Focus on practical applications over pure theory.",
    evidence: [
      {
        title: "Projects",
        description: "AI and data projects in the portfolio",
        sectionLink: "#projects",
        tags: ["Research", "Applied ML"],
      },
    ],
  },
  "skeptic-ship": {
    heading: "Shipping Record",
    summary: "Multiple deployed projects with real users. Not just side projects — actual production systems with monitoring, error handling, and iteration.",
    evidence: [
      {
        title: "Live Projects",
        description: "Projects with live URLs and active users",
        sectionLink: "#projects",
        tags: ["Shipped", "Production"],
      },
      {
        title: "Work Experience",
        description: "Internship deliverables that made it to production",
        sectionLink: "#experience",
        tags: ["Internship", "Delivered"],
      },
    ],
  },
  "skeptic-built": {
    heading: "What I've Actually Built",
    summary: "Real projects: web apps, data pipelines, AI tools, and infrastructure. All in the projects section with links to live demos and source code.",
    evidence: [
      {
        title: "Projects",
        description: "Full project list with tech stack and links",
        sectionLink: "#projects",
        tags: ["Built", "Real"],
      },
    ],
  },
  "skeptic-impact": {
    heading: "Real-World Impact",
    summary: "Projects used by real people, internship work that shipped to production, and open source contributions. Impact is measurable.",
    evidence: [
      {
        title: "Achievements",
        description: "Awards, recognitions, and measurable outcomes",
        sectionLink: "#achievements",
        tags: ["Impact", "Results"],
      },
    ],
  },
  "skeptic-why": {
    heading: "Why You Should Care",
    summary: "Strong fundamentals, ships real things, learns fast, and communicates clearly. The combination of technical depth and product sense is rare.",
    evidence: [
      {
        title: "Full Profile",
        description: "See the complete picture across all sections",
        sectionLink: "#about",
        tags: ["Overview", "Profile"],
      },
    ],
  },
};

// Proof pack generator
export function generateProofPack(mode: LabMode): string {
  const chips = LAB_CHIPS[mode];
  const lines: string[] = [
    `=== Portfolio Lab — ${mode} Mode ===`,
    "",
  ];

  for (const chip of chips) {
    const response = LAB_RESPONSES[chip.responseKey];
    if (!response) continue;
    lines.push(`## ${response.heading}`);
    lines.push(response.summary);
    lines.push("");
    for (const item of response.evidence) {
      lines.push(`• ${item.title}: ${item.description}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("Generated by Portfolio Lab · anant.dev");

  return lines.join("\n");
}
