import { ExternalLink } from "lucide-react";
import { defineQuery } from "next-sanity";
import { SpaceRail } from "@/components/ui/space-rail";
import { sanityFetch } from "@/sanity/lib/live";
import type { Achievement } from "@/sanity/types";

const ACHIEVEMENTS_SECTION_QUERY = defineQuery(`
  *[_type == "achievement"] | order(featured desc, date desc){
    _id, title, description, date, type, issuer, featured, url
  }
`);

export async function AchievementsSection() {
  const { data: items } = await sanityFetch({
    query: ACHIEVEMENTS_SECTION_QUERY,
  });
  if (!items?.length) return null;

  const list = items as Achievement[];

  return (
    <section id="achievements" className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-12 text-center">
        <p className="section-kicker">{"// signal log"}</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
          Achievements &amp; Awards
        </h2>
      </div>

      <div className="flex gap-4">
        <SpaceRail itemCount={list.length} />
        <div className="flex-1 min-w-0">
          {list.map((item) => {
            const year = item.date
              ? String(new Date(item.date).getFullYear())
              : "—";
            return (
              <div
                key={item._id}
                className="group relative flex gap-3 border-b border-white/[0.06] py-5 transition-colors duration-150 ease-out hover:bg-[rgba(167,139,250,0.04)]"
              >
                {/* Year column — tightened from w-16 to w-10 */}
                <div className="flex w-10 shrink-0 flex-col items-start gap-1.5">
                  <div className="flex min-h-[10px] items-center gap-1.5">
                    {item.featured ? (
                      <span
                        className="h-1 w-1 shrink-0 rounded-full bg-violet-500"
                        aria-hidden
                      />
                    ) : (
                      <span className="h-1 w-1 shrink-0" aria-hidden />
                    )}
                    <span className="font-mono text-xs text-white/30">
                      {year}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 px-2 md:px-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-white/85">
                      {item.title}
                    </h3>
                    {item.type ? (
                      <span className="orbit-chip">{item.type}</span>
                    ) : null}
                  </div>
                  {item.issuer ? (
                    <p className="mt-0.5 text-xs text-white/35 font-sans">
                      {item.issuer}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-white/40">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex w-8 shrink-0 items-center justify-end">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open link for ${item.title ?? "achievement"}`}
                      className="float-btn flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/25 transition-colors hover:text-white/60"
                    >
                      <ExternalLink className="size-3.5" strokeWidth={1.75} />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
