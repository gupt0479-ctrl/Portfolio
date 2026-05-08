"use client";

import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Blog } from "@/sanity/types";

const PINNED_GITHUB = {
  id: "pinned-github",
  title: "GitHub",
  description:
    "All my public repositories, experiments, and open source work.",
  url: "https://github.com/anantgupta129",
} as const;

function MagneticButton({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.15;
    const dy = (e.clientY - cy) * 0.15;
    setOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: "transform 200ms ease" }}
      className="float-btn text-xs text-violet-300/90 hover:text-violet-200 font-sans px-3 py-1 rounded-full border border-violet-500/30"
    >
      {children}
    </a>
  );
}

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

export function BlogFeed({ posts }: { posts: Blog[] }) {
  return (
    <div className="flex flex-col gap-4">
      <article
        className="float-btn relative w-full rounded-xl border border-white/10 border-l-2 border-l-violet-500/60 cosmic-card p-5 transition-colors duration-200 hover:border-white/20"
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
              <MagneticButton href={PINNED_GITHUB.url}>Visit →</MagneticButton>
            </div>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const href = `/blog/${post.slug?.current ?? ""}`;
          return (
            <Link
              key={post._id}
              href={href}
              className="float-btn group relative flex min-h-[180px] flex-col rounded-xl border border-white/10 cosmic-card p-5 transition-colors duration-200 hover:border-white/[0.28]"
            >
              <span
                className="absolute right-4 top-4 text-white/25 transition-colors group-hover:text-white/50"
                aria-hidden
              >
                <ExternalLink className="size-3.5" strokeWidth={1.75} />
              </span>
              {post.category ? (
                <span className="orbit-chip">{post.category}</span>
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
