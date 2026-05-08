import { ExternalLink } from "lucide-react";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { Achievement } from "@/sanity/types";
import { CometCard } from "@/components/ui/comet-card";

const ACHIEVEMENTS_SECTION_QUERY = defineQuery(`
  *[_type == "achievement"] | order(featured desc, date desc){
    _id, title, description, date, type, featured, url
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
      <h2 className="mb-10 text-2xl font-display font-semibold text-white">
        Achievements &amp; Awards
      </h2>

      <CometCard variant="subtle" rotateDepth={4} translateDepth={6}>
        <div className="relative overflow-hidden rounded-xl p-6">
          {/* Vertical glowing rail */}
          <div
            className="absolute left-6 top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(143,124,247,0.3) 0%, rgba(143,124,247,0.1) 100%)",
            }}
            aria-hidden
          />

          <div className="border-t border-white/[0.06]">
            {list.map((item) => {
              const year = item.date
                ? String(new Date(item.date).getFullYear())
                : "—";
              return (
                <div
                  key={item._id}
                  className={[
                    "group relative flex gap-4 border-b border-white/[0.06] py-5 pl-10 transition-colors duration-150 ease-out",
                    "hover:bg-[rgba(167,139,250,0.04)]",
                  ].join(" ")}
                >
                  {/* Rail dot */}
                  <div
                    className="absolute left-[21px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500/30 group-hover:bg-violet-500/60 transition-colors"
                    aria-hidden
                  />

                  <div className="flex w-16 shrink-0 flex-col items-start gap-1.5">
                    <div className="flex min-h-[10px] items-center gap-2">
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

                  <div className="min-w-0 flex-1 px-2 md:px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium text-white/85">
                        {item.title}
                      </h3>
                      {item.type ? (
                        <span className="orbit-chip">{item.type}</span>
                      ) : null}
                    </div>
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
      </CometCard>
    </section>
  );
}
