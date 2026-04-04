import { defineQuery } from "next-sanity";
import { EducationEntry } from "@/components/EducationEntry";
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
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
          Education
        </h2>
        <p className="text-lg text-white/60 mt-3 font-sans">
          Academic background and continuous learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((edu) => (
          <EducationEntry key={edu._id} edu={edu} />
        ))}
      </div>
    </section>
  );
}
