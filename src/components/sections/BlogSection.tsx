import { defineQuery } from "next-sanity";
import { BlogFeed } from "@/components/BlogFeed";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { Blog } from "@/sanity/types";

const BLOG_SECTION_QUERY = defineQuery(`
  *[_type == "blog"] | order(publishedAt desc)[0...6]{
    _id, title, slug, excerpt, externalUrl, publishedAt, readTime, category
  }
`);

export async function BlogSection() {
  const [{ data: posts }, { data: settings }] = await Promise.all([
    sanityFetch({ query: BLOG_SECTION_QUERY }),
    sanityFetch({ query: SITE_SETTINGS_QUERY }),
  ]);

  if (settings?.showBlog === false) return null;

  const list = (posts ?? []) as Blog[];

  return (
    <section
      id="blog"
      className="section-backdrop mx-auto max-w-6xl px-6 py-24"
    >
      <div className="mb-16">
        <p className="section-kicker">{"// uplink"}</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
          What I Read or Do
        </h2>
        <p className="text-lg text-white/55 mt-3 font-sans">
          Resources, updates and second brain
        </p>
      </div>
      <BlogFeed posts={list} />
    </section>
  );
}
