import { ExperienceCard } from "@/components/cards/ExperienceCard";
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

      <div className="flex flex-col gap-0">
        {shown.map((exp, idx) => (
          <div key={exp._id} className="relative flex gap-6">
            {/* Timeline column */}
            <div className="flex flex-col items-center w-6 shrink-0">
              {/* Connector line (top) — not before first item */}
              {idx > 0 && (
                <div className="w-0.5 flex-1 min-h-[24px] bg-gradient-to-b from-violet-500/30 to-violet-500/20" />
              )}
              {/* Dot — naturally centered with the card's first line */}
              <div
                className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0 my-1"
                style={{
                  boxShadow:
                    "0 0 0 3px rgba(143,124,247,0.2), 0 0 12px rgba(143,124,247,0.35)",
                }}
                aria-hidden
              />
              {/* Connector line (bottom) — not after last item */}
              {idx < shown.length - 1 && (
                <div className="w-0.5 flex-1 min-h-[24px] bg-gradient-to-b from-violet-500/20 to-violet-500/10" />
              )}
            </div>
            {/* Card */}
            <div className="flex-1 pb-6">
              <ExperienceCard experience={exp} index={idx} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
