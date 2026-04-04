import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { sanityFetch } from "@/sanity/lib/live";
import { EXPERIENCE_QUERY } from "@/sanity/lib/queries";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

export async function ExperienceSection() {
  const { data: experience } = await sanityFetch({ query: EXPERIENCE_QUERY });

  const experiences = (experience ?? []) as EXPERIENCE_QUERYResult;
  const shown = experiences.slice(0, 5);

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
          Experience
        </h2>
        <p className="text-lg text-white/60 mt-3">
          Full-time roles, freelance, and open-source contributions.
        </p>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-px z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(143,124,247,0.5) 0%, rgba(143,124,247,0.1) 100%)",
          }}
          aria-hidden
        />

        <div className="flex flex-col gap-6">
          {shown.map((exp, idx) => (
            <div key={exp._id} className="relative pl-[28px]">
              <div
                className="absolute left-[-5px] top-[28px] z-[1] h-[10px] w-[10px] rounded-full bg-[#8f7cf7]"
                style={{
                  boxShadow:
                    "0 0 0 3px rgba(143,124,247,0.2), 0 0 12px rgba(143,124,247,0.35)",
                }}
                aria-hidden
              />
              <ExperienceCard experience={exp} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
