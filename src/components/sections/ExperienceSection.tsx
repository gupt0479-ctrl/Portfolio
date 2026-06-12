import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { SpaceRail } from "@/components/ui/space-rail";
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
      className="section-backdrop mx-auto max-w-6xl px-6 py-18"
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

      {/* SpaceRail + cards share a 2-column flex layout.
          SpaceRail is "use client" but ExperienceSection stays async/server —
          Next.js allows a server component to import a client component. */}
      <div className="flex gap-6">
        {/* Timeline track — SpaceRail owns the full-height column */}
        <SpaceRail itemCount={shown.length} />

        {/* Cards column — each card bottom-padding creates the vertical spacing
            that matches the dot distribution inside SpaceRail */}
        <div className="flex flex-col flex-1 min-w-0">
          {shown.map((exp, idx) => (
            <div key={exp._id} className={idx < shown.length - 1 ? "pb-6" : ""}>
              <ExperienceCard experience={exp} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
