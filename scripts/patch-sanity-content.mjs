import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";

function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnv();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  token: process.env.SANITY_SERVER_API_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const ref = (id) => ({ _type: "reference", _ref: id, _key: id });

const experiencePatches = {
  "exp-1": {
    responsibilities: [
      "Developed Assisto, a production ed-tech web platform using Next.js, React, and Tailwind CSS",
      "Integrated Strapi CMS APIs for dynamic content management and backend-driven pages",
      "Built reusable UI components focused on performance, accessibility, and SEO",
      "Collaborated with managers on requirements, feature iteration, and early client onboarding",
    ],
    achievements: [
      "Shipped Assisto to production supporting early user onboarding",
      "Established reusable component patterns that accelerated page development",
      "Improved site performance and SEO across the platform",
    ],
    technologies: [
      ref("skill-nextjs"),
      ref("skill-react"),
      ref("skill-tailwind"),
      ref("skill-typescript"),
      ref("skill-restapi"),
    ],
  },
  "exp-2": {
    responsibilities: [
      "Built the initial Techlit learning portal with HTML, CSS, and Python backend integrations",
      "Coordinated feature planning and delivery with a remote U.S.–India team",
      "Deployed and maintained the platform supporting cross-cultural education initiatives",
      "Managed project timelines and communication across international collaborators",
    ],
    achievements: [
      "Launched Techlit, a cross-cultural learning platform with U.S. collaborators",
      "Delivered core portal features enabling remote team coordination",
      "Gained hands-on startup experience in product delivery and team leadership",
    ],
    technologies: [ref("skill-python"), ref("skill-react"), ref("skill-git")],
  },
  "exp-3": {
    company: "University of Minnesota",
    responsibilities: [
      "Develop Python and Rust APIs for astronomical alert brokering on the BOOM project",
      "Build real-time event tracking and observability tooling for Linux data pipelines",
      "Design structured ingestion APIs for large observational datasets",
      "Implement backend workflows integrating Kafka, MongoDB, Redis, and Docker",
    ],
    achievements: [
      "Contributed to BOOM alert-brokering infrastructure for astronomical event streams",
      "Designed analytics-ready ingestion pipelines for large observational datasets",
      "Built observability tooling supporting real-time event monitoring in research systems",
    ],
    technologies: [
      ref("skill-python"),
      ref("skill-mongodb"),
      ref("skill-redis"),
      ref("skill-docker"),
      ref("skill-restapi"),
    ],
  },
  "exp-4": {
    company: "University of Minnesota",
    description: [
      {
        _type: "block",
        _key: "research-srivastava",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "research-srivastava-span",
            marks: [],
            text: "Researching machine learning methods for large-scale data analysis under Professor Jaideep Srivastava. Focus areas include feature engineering, model evaluation, and building reproducible ML pipelines that turn complex observational and behavioral datasets into actionable insights. Work emphasizes practical experimentation, literature-driven design, and scalable data workflows rather than one-off prototypes.",
          },
        ],
      },
    ],
    responsibilities: [
      "Research ML approaches for pattern discovery in large-scale datasets",
      "Design and prototype data pipelines supporting model training and evaluation",
      "Collaborate with faculty on experiment design, literature review, and reproducible workflows",
      "Document findings and contribute to research codebases",
    ],
    achievements: [
      "Building applied ML research experience under faculty mentorship at the University of Minnesota",
      "Developing reproducible experimentation workflows for large-scale data analysis",
    ],
    technologies: [
      ref("skill-python"),
      ref("skill-tensorflow"),
      ref("skill-postgresql"),
      ref("skill-git"),
    ],
  },
  "exp-5": {
    responsibilities: [
      "Consult with clients to gather requirements and propose technical solutions",
      "Build responsive websites and lightweight web applications end to end",
      "Manage project timelines, revisions, and deployment handoffs",
      "Provide maintenance and iterative improvements after launch",
    ],
    achievements: [
      "Delivered client projects across the full lifecycle from scoping to deployment",
      "Built long-term client relationships through consistent communication and delivery",
      "Strengthened independent product and client-management skills outside formal employment",
    ],
    technologies: [
      ref("skill-react"),
      ref("skill-nextjs"),
      ref("skill-tailwind"),
      ref("skill-git"),
    ],
  },
};

const blogUrls = {
  "blog-1": "https://nextjs.org/docs",
  "blog-2": "https://platform.openai.com/docs/guides/gpt",
  "blog-3": "https://www.typescriptlang.org/docs/handbook/intro.html",
  "blog-4": "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
  "blog-5": "https://nodejs.org/en/learn/diagnostics/memory",
  "blog-6": "https://staffeng.com/guides",
};

const achievements = [
  {
    _id: "achieve-1",
    _type: "achievement",
    title: "Research Assistant — BOOM Project",
    type: "experience",
    issuer: "University of Minnesota",
    date: "2025-05-01",
    description:
      "Selected as Research Assistant for BOOM (Burst & Outburst Observations Monitor), developing Rust- and Python-based tooling for astronomical alert brokering and event-stream observability under Professor Michael Coughlin.",
    url: "",
    featured: true,
    order: 1,
  },
  {
    _id: "achieve-2",
    _type: "achievement",
    title: "Web Development Internship at NSEdu",
    type: "experience",
    issuer: "Narayan Solutions",
    date: "2025-06-01",
    description:
      "Completed a 3-month internship developing and deploying Assisto using Next.js, React, and Tailwind CSS. Built accessible UI components and integrated Strapi-backed content systems.",
    url: "",
    featured: true,
    order: 2,
  },
  {
    _id: "achieve-3",
    _type: "achievement",
    title: "Professional Cricket Player (U-14 & U-16)",
    type: "sports",
    issuer: "KSCA (Karnataka State Cricket Academy)",
    date: "2020-12-31",
    description:
      "Competed in state-level cricket tournaments representing Karnataka at U-14 and U-16 levels, building discipline, teamwork, and competitive focus.",
    url: "",
    featured: true,
    order: 3,
  },
  {
    _id: "achieve-4",
    _type: "achievement",
    title: "Cultural Committee President",
    type: "leadership",
    issuer: "Ryan International School",
    date: "2021-06-30",
    description:
      "Led the Cultural Committee at Ryan International School, organizing school-wide cultural events and coordinating student initiatives.",
    url: "",
    featured: true,
    order: 4,
  },
  {
    _id: "achieve-5",
    _type: "achievement",
    title: "Co-Founder of Techlit Startup",
    type: "entrepreneurship",
    issuer: "Self",
    date: "2022-06-30",
    description:
      "Co-founded Techlit (techlit.tech), a cross-cultural learning platform built with collaborators in the United States. Gained early startup experience in product delivery and remote team coordination.",
    url: "http://techlit.tech/#about-techlit",
    featured: true,
    order: 5,
  },
  {
    _id: "achieve-6",
    _type: "achievement",
    title: "CSE Student Ambassador",
    type: "leadership",
    issuer: "University of Minnesota",
    date: "2025-09-01",
    description:
      "Selected as CSE Student Ambassador to lead campus tours for prospective students, strengthening public speaking, communication, and leadership through student engagement.",
    url: "",
    featured: false,
    order: 6,
  },
];

const certPatches = {
  "cert-3": {
    description:
      "Validates practical skills in building and training neural networks with TensorFlow, including computer vision and NLP workflows relevant to applied ML projects.",
  },
  "cert-8": {
    description:
      "Coursera specialization covering neural networks, CNNs, sequence models, and hyperparameter tuning — foundational ML theory applied to modern deep learning systems.",
  },
};

async function main() {
  for (const [id, patch] of Object.entries(experiencePatches)) {
    await client.patch(id).set(patch).commit();
    console.log(`patched experience ${id}`);
  }

  for (const [id, externalUrl] of Object.entries(blogUrls)) {
    await client.patch(id).set({ externalUrl }).commit();
    console.log(`patched blog ${id}`);
  }

  for (const achievement of achievements) {
    await client.createOrReplace(achievement);
    console.log(`upserted achievement ${achievement._id}`);
  }

  for (const [id, patch] of Object.entries(certPatches)) {
    await client.patch(id).set(patch).commit();
    console.log(`patched certification ${id}`);
  }

  await client
    .patch("singleton-site-settings")
    .set({
      siteDescription:
        "Portfolio of Anant Gupta — full-stack development, applied machine learning, and research-driven systems engineering.",
    })
    .commit();
  console.log("patched site settings");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
