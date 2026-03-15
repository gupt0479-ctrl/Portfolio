import { Footer } from "@/components/Footer";
import { HeaderScrolling } from "@/components/HeaderScrolling";
import { AboutSection } from "@/components/sections/AboutSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import HeroSection from "@/components/sections/HeroSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import ObsidianBackground from "@/components/three/ObsidianBackground";
import { ProjectsSlider } from "@/components/three/ProjectsSlider";
import { sanityFetch } from "@/sanity/lib/live";
import { NAVIGATION_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import type {
  NAVIGATION_QUERYResult,
  PROJECTS_QUERYResult,
} from "@/sanity/types";

export default async function PortfolioContent() {
  const [{ data: navLinks }, { data: projects }] = await Promise.all([
    sanityFetch({ query: NAVIGATION_QUERY }),
    sanityFetch({ query: PROJECTS_QUERY }),
  ]);

  const navItems = ((navLinks ?? []) as NAVIGATION_QUERYResult)
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ObsidianBackground />
      </div>
      <main className="relative z-10 min-h-screen text-white">
        <HeroSection />
        <AboutSection />
        <TestimonialsSection />
        <ExperienceSection />
        <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              Projects
            </h2>
            <p className="text-lg text-white/60 mt-3 font-sans">
              Featured work spanning web, AI, and infrastructure.
            </p>
          </div>
          <ProjectsSlider projects={(projects ?? []) as PROJECTS_QUERYResult} />
        </section>
        <SkillsSection />
        <EducationSection />
        <CertificationsSection />
        <AchievementsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
