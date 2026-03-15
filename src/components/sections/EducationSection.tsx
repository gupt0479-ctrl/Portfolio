import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { Education } from "@/sanity/types";

const EDUCATION_SECTION_QUERY = defineQuery(`
  *[_type == "education"] | order(startDate desc){
    _id, institution, degree, fieldOfStudy, startDate, endDate, current, description, gpa
  }
`);

export async function EducationSection() {
  const { data: items } = await sanityFetch({
    query: EDUCATION_SECTION_QUERY,
  });
  if (!items?.length) return null;

  const list = items as Education[];

  return (
    <section id="education" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-display font-bold">
          Education
        </h2>
        <p className="text-lg text-white/60 mt-3 font-sans">
          Academic background and continuous learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((edu) => (
          <div
            key={edu._id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(168,85,247,0.12)]"
          >
            <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
              <h3 className="text-lg font-display font-semibold text-white">
                {edu.degree}
              </h3>
              <span className="text-xs text-white/50 font-sans whitespace-nowrap">
                {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} —{" "}
                {edu.current
                  ? "Present"
                  : edu.endDate
                    ? new Date(edu.endDate).getFullYear()
                    : ""}
              </span>
            </div>

            {edu.fieldOfStudy && (
              <p className="text-white/60 text-sm font-sans mb-3">
                in {edu.fieldOfStudy}
              </p>
            )}

            <p className="text-white/50 font-sans text-sm mb-4">
              {edu.institution}
            </p>

            {edu.description && (
              <p className="text-white/65 text-sm font-sans leading-relaxed mb-4">
                {edu.description}
              </p>
            )}

            {edu.gpa && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-xs font-semibold text-white/80 font-sans">
                GPA: {edu.gpa}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
