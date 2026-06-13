import { defineQuery } from "next-sanity";
import { EducationFlowchart } from "@/components/EducationFlowchart";
import { sanityFetch } from "@/sanity/lib/live";
import type { Education } from "@/sanity/types";

const EDUCATION_SECTION_QUERY = defineQuery(`
  *[_type == "education"] | order(startDate desc){
    _id, institution, degree, fieldOfStudy, startDate, endDate, current, description, gpa, logo
  }
`);

export async function EducationSection() {
  const { data: items } = await sanityFetch({
    query: EDUCATION_SECTION_QUERY,
  });
  if (!items?.length) return null;

  const list = items as Education[];

  return (
    <section
      id="education"
      className="section-backdrop section-pad mx-auto max-w-6xl px-6"
    >
      <div className="mb-16 text-center">
        <p className="section-kicker">{"// origins"}</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
          Education
        </h2>
        <p className="text-lg text-white/60 mt-3 font-sans">
          Academic background and continuous learning.
        </p>
      </div>

      <EducationFlowchart items={list} />
    </section>
  );
}
