import { sanityFetch } from "@/sanity/lib/live";
import { EXPERIENCE_QUERY } from "@/sanity/lib/queries";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

export async function ExperienceSection() {
  const { data: experience } = await sanityFetch({ query: EXPERIENCE_QUERY });

  const experiences = (experience ?? []) as EXPERIENCE_QUERYResult;

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Experience
        </h2>
        <p className="text-lg text-white/60 mt-3">
          Full-time roles, freelance, and open-source contributions.
        </p>
      </div>

      <div className="grid gap-6">
        {experiences.slice(0, 5).map((exp, idx) => (
          <ExperienceCard key={exp._id} experience={exp} index={idx} />
        ))}
      </div>
    </section>
  );
}
