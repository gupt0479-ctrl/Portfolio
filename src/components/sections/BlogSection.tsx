import Image from "next/image";
import Link from "next/link";
import { defineQuery } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import type { Blog } from "@/sanity/types";

const BLOG_SECTION_QUERY = defineQuery(`
  *[_type == "blog"] | order(publishedAt desc)[0...6]{
    _id, title, slug, excerpt, publishedAt, readTime, category, featuredImage
  }
`);

export async function BlogSection() {
  const { data: posts } = await sanityFetch({
    query: BLOG_SECTION_QUERY,
  });
  if (!posts?.length) return null;

  const list = posts as Blog[];

  return (
    <section id="blog" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold">Latest Posts</h2>
        <p className="text-lg text-muted-foreground mt-3">
          Thoughts, tutorials, and updates.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug?.current ?? ""}`}
            className="group rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-colors"
          >
            {post.featuredImage && (
              <div className="relative h-48 w-full">
                <Image
                  src={urlFor(post.featuredImage).width(600).height(300).url()}
                  alt={post.title ?? "Blog post"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-5">
              {post.category && (
                <span className="text-xs text-primary font-medium">
                  {post.category}
                </span>
              )}
              <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {post.readTime && <span>{post.readTime} min read</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
