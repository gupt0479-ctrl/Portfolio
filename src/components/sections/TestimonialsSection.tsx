import { defineQuery } from "next-sanity";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";

const TESTIMONIALS_SECTION_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc){ _id, testimonial, name, position, avatar }
`);

type TestimonialRow = {
  testimonial?: string;
  name?: string;
  position?: string;
  avatar?: { _type: string; asset?: { _ref: string } };
};

export async function TestimonialsSection() {
  const { data } = await sanityFetch({ query: TESTIMONIALS_SECTION_QUERY });
  if (!data?.length) return null;

  const defaultImg =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500";
  const testimonials = (data as TestimonialRow[]).map((t) => ({
    quote: t.testimonial ?? "",
    name: t.name ?? "",
    designation: t.position ?? "",
    src: t.avatar ? urlFor(t.avatar).width(500).url() : defaultImg,
  }));

  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold">Client Testimonials</h2>
        <p className="text-lg text-muted-foreground mt-3">
          What others say about working with me.
        </p>
      </div>
      <AnimatedTestimonials testimonials={testimonials} autoplay />
    </section>
  );
}
