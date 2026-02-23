import { Footer } from "@/components/Footer";
import { HeaderScrolling } from "@/components/HeaderScrolling";
import HeroSection from "@/components/sections/HeroSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectCard3D } from "@/components/three/ProjectCard3D";
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
      {/* Scroll-Reveal Header */}
      <HeaderScrolling nav={navItems} />

      {/* Main Content */}
      <main className="min-h-screen text-white">
        {/* Hero with Obsidian */}
        <HeroSection />

        {/* Projects with 3D Cards */}
        <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Projects
            </h2>
            <p className="text-lg text-white/60 mt-3">
              Featured work spanning web, AI, and infrastructure.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {((projects ?? []) as PROJECTS_QUERYResult)
              .slice(0, 6)
              .map((p, idx) => (
                <ProjectCard3D key={p._id} project={p} index={idx} />
              ))}
          </div>
        </section>

        {/* Experience with Tilt Cards */}
        <ExperienceSection />

        {/* Skills */}
        <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            Skills
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {((skills ?? []) as SKILLS_QUERYResult)
              .filter(
                (s) => typeof s?.name === "string" && s.name.trim().length > 0,
              )
              .slice(0, 24)
              .map((s) => (
                <div
                  key={s._id}
                  className="group text-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition"
                >
                  <div className="font-medium text-sm text-white">{s.name}</div>
                  {s.proficiency && (
                    <div className="text-xs text-white/50 mt-1">
                      {s.proficiency}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            Contact
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="text-white/80">
              Let's work together.{" "}
              <a
                href="/studio"
                className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60 transition"
              >
                Edit content in Studio
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
