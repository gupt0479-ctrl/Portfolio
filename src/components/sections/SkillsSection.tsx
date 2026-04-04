import { SkillsSectionClient } from "@/components/sections/SkillsSectionClient";
import { sanityFetch } from "@/sanity/lib/live";
import { SKILLS_QUERY } from "@/sanity/lib/queries";

export async function SkillsSection() {
  const { data: skills } = await sanityFetch({ query: SKILLS_QUERY });
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
          Skills &amp; Expertise
        </h2>
        <p className="mt-3 font-sans text-lg text-white/55">
          Technologies I work with every day.
        </p>
      </div>
      <SkillsSectionClient skills={skills ?? []} />
    </section>
  );
}
