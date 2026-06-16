import { ExperienceSectionClient } from "@/components/sections/ExperienceSectionClient";
import { sanityFetch } from "@/sanity/lib/live";
import { EXPERIENCE_QUERY } from "@/sanity/lib/queries";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

export async function ExperienceSection() {
  const { data: experience } = await sanityFetch({ query: EXPERIENCE_QUERY });

  const experiences = (experience ?? []) as EXPERIENCE_QUERYResult;
  const shown = experiences.slice(0, 5);

  return (
    <section
      id="experience"
      className="section-backdrop section-pad mx-auto max-w-6xl px-6"
    >
      <div className="mb-16 text-center">
        <p className="section-kicker">{"// trajectory"}</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
          Experience
        </h2>
        <p className="text-lg text-white/60 mt-3">
          Full-time roles, freelance, and open-source contributions.
        </p>
      </div>

      <ExperienceSectionClient experiences={shown} />
    </section>
  );
}
