import { SkillsGrid } from "@/components/SkillsGrid";
import { sanityFetch } from "@/sanity/lib/live";
import { SKILLS_QUERY } from "@/sanity/lib/queries";

export async function SkillsSection() {
  const { data: skills } = await sanityFetch({ query: SKILLS_QUERY });
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold">Skills & Expertise</h2>
        <p className="text-lg text-muted-foreground mt-3">
          Technologies I work with every day.
        </p>
      </div>
      <SkillsGrid skills={skills ?? []} />
    </section>
  );
}
