import { Footer } from "@/components/Footer";
import { HeaderScrolling } from "@/components/HeaderScrolling";
import { SkillsGrid } from "@/components/SkillsGrid";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import HeroSection from "@/components/sections/HeroSection";
import { ProjectsSlider } from "@/components/three/ProjectsSlider";
import { sanityFetch } from "@/sanity/lib/live";
import {
  NAVIGATION_QUERY,
  PROJECTS_QUERY,
  SKILLS_QUERY,
} from "@/sanity/lib/queries";
import type {
  NAVIGATION_QUERYResult,
  PROJECTS_QUERYResult,
  SKILLS_QUERYResult,
} from "@/sanity/types";

export default async function PortfolioContent() {
  const [{ data: nav }, { data: projects }, { data: skills }] =
    await Promise.all([
      sanityFetch({ query: NAVIGATION_QUERY }),
      sanityFetch({ query: PROJECTS_QUERY }),
      sanityFetch({ query: SKILLS_QUERY }),
    ]);

  const navItems = ((nav ?? []) as NAVIGATION_QUERYResult)
    .filter((item) => !!item.title && !!item.href)
    .map((item) => ({
      _id: item._id,
      title: item.title as string,
      href: item.href as string,
      isExternal: item.isExternal,
    }));

  return (
    <>
      <HeaderScrolling nav={navItems} />

      <main className="min-h-screen text-white">
        {/* Hero */}
        <HeroSection />

        {/* Projects */}
        <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Projects
            </h2>
            <p className="text-lg text-white/60 mt-3">
              Featured work spanning web, AI, and infrastructure.
            </p>
          </div>

          <ProjectsSlider projects={(projects ?? []) as PROJECTS_QUERYResult} />
        </section>

        {/* Experience */}
        <ExperienceSection />

        {/* Skills - ENHANCED */}
        <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Skills
            </h2>
            <p className="text-lg text-white/60 mt-3">
              Technologies and tools I work with.
            </p>
          </div>

          <SkillsGrid skills={(skills ?? []) as SKILLS_QUERYResult} />
        </section>
      </main>

      <Footer />
    </>
  );
}
