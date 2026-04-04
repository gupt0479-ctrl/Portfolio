"use client";

import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { Blog } from "@/sanity/types";

const PINNED_GITHUB = {
  id: "pinned-github",
  title: "GitHub",
  description:
    "All my public repositories, experiments, and open source work.",
  url: "https://github.com/TODO_REPLACE_WITH_HANDLE",
} as const;

function formatPostDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .replace(",", "");
}

function card3d(hovered: boolean): CSSProperties {
  return {
    transition: "transform 180ms ease, box-shadow 180ms ease",
    willChange: "transform",
    transform: hovered
      ? "perspective(600px) rotateX(8deg) translateY(-4px) scale(1.03)"
      : "none",
    boxShadow: hovered
      ? "0 8px 20px rgba(167,139,250,0.12)"
      : "none",
  };
}

export function BlogFeed({ posts }: { posts: Blog[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <article
        className="relative w-full rounded-xl border border-white/10 border-l-2 border-l-violet-500/60 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-white/20"
        onMouseEnter={() => setHoveredId(PINNED_GITHUB.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={card3d(hoveredId === PINNED_GITHUB.id)}
      >
        <div className="flex items-start gap-3">
          <Github className="mt-0.5 size-4 shrink-0 text-white/50" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium text-white/85">
              {PINNED_GITHUB.title}
            </h3>
            <p className="mt-1 text-sm text-white/45 font-sans leading-relaxed">
              {PINNED_GITHUB.description}
            </p>
            <div className="mt-3 flex justify-end">
              <a
                href={PINNED_GITHUB.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-300/90 hover:text-violet-200 font-sans"
              >
                Visit →
              </a>
            </div>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const href = `/blog/${post.slug?.current ?? ""}`;
          const hovered = hoveredId === post._id;
          return (
            <Link
              key={post._id}
              href={href}
              onMouseEnter={() => setHoveredId(post._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={card3d(hovered)}
              className="group relative flex min-h-[180px] flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-white/[0.28]"
            >
              <span
                className="absolute right-4 top-4 text-white/25 transition-colors group-hover:text-white/50"
                aria-hidden
              >
                <ExternalLink className="size-3.5" strokeWidth={1.75} />
              </span>
              {post.category ? (
                <span className="inline-block rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/35">
                  {post.category}
                </span>
              ) : null}
              <h3 className="mt-2 line-clamp-2 text-base font-medium text-white/85 pr-8">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="mt-1 line-clamp-2 text-sm text-white/45 font-sans">
                  {post.excerpt}
                </p>
              ) : null}
              <div className="mt-auto pt-3 flex items-center justify-between gap-3 text-xs text-white/30 font-sans">
                <span>{formatPostDate(post.publishedAt)}</span>
                {post.readTime != null ? (
                  <span>{post.readTime} min read</span>
                ) : (
                  <span />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/*
        TODO: archived toggle — schema gap.
        The blog schema does not currently have an archived boolean field.
        When the field is added in Pass 3, implement a "Show all / Hide archived"
        client-side toggle here. For now, render all returned posts.
      */}
    </div>
  );
}
