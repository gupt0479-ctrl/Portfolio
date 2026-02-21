import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import Hero3D from "@/components/sections/Hero3D";
import { sanityFetch } from "@/sanity/lib/live";
import {
  EXPERIENCE_QUERY,
  NAVIGATION_QUERY,
  PROFILE_QUERY,
  PROJECTS_QUERY,
  SITE_SETTINGS_QUERY,
  SKILLS_QUERY,
} from "@/sanity/lib/queries";
import type {
  EXPERIENCE_QUERYResult,
  PROJECTS_QUERYResult,
  SKILLS_QUERYResult,
} from "@/sanity/types";

export default async function PortfolioContent() {
  const [
    _profile,
    _siteSettings,
    { data: nav },
    { data: projects },
    { data: skills },
    { data: experience },
  ] = await Promise.all([
    sanityFetch({ query: PROFILE_QUERY }),
    sanityFetch({ query: SITE_SETTINGS_QUERY }),
    sanityFetch({ query: NAVIGATION_QUERY }),
    sanityFetch({ query: PROJECTS_QUERY }),
    sanityFetch({ query: SKILLS_QUERY }),
    sanityFetch({ query: EXPERIENCE_QUERY }),
  ]);

  return (
    <>
      <Header
        nav={(nav ?? [])
          .filter(
            (item): item is typeof item & { title: string; href: string } =>
              typeof item.title === "string" && typeof item.href === "string",
          )
          .map((item) => ({
            _id: item._id,
            title: item.title,
            href: item.href,
            isExternal: item.isExternal ?? undefined,
          }))}
      />
      <main className="min-h-screen bg-black text-white">
        <Hero3D />

        <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {((projects ?? []) as PROJECTS_QUERYResult).slice(0, 6).map((p) => (
              <div
                key={p._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="text-lg font-medium">
                  {p.title || "Untitled"}
                </div>
                {p.tagline ? (
                  <div className="mt-1 text-sm text-white/70">{p.tagline}</div>
                ) : null}
                <div className="mt-4 flex gap-3 text-sm">
                  {p.liveUrl ? (
                    <a
                      className="text-white/80 hover:text-white"
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live
                    </a>
                  ) : null}
                  {p.githubUrl ? (
                    <a
                      className="text-white/80 hover:text-white"
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Code
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">Experience</h2>

          <div className="mt-6 grid gap-4">
            {((experience ?? []) as EXPERIENCE_QUERYResult)
              .slice(0, 5)
              .map((e) => (
                <div
                  key={e._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {`${e.position ?? ""} · `}
                      <span className="text-white/80">{e.company ?? ""}</span>
                    </div>

                    <div className="text-sm text-white/60">
                      {e.startDate ?? ""}{" "}
                      {e.endDate
                        ? `– ${e.endDate}`
                        : e.current
                          ? "– Present"
                          : ""}
                    </div>
                  </div>

                  {Array.isArray(e.responsibilities) &&
                  e.responsibilities.some(
                    (r) => typeof r === "string" && r.trim().length,
                  ) ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/70">
                      {e.responsibilities
                        .filter(
                          (r): r is string =>
                            typeof r === "string" && r.trim().length > 0,
                        )
                        .slice(0, 4)
                        .map((r, i) => (
                          <li key={`${e._id}-r-${i}`}>{r}</li>
                        ))}
                    </ul>
                  ) : null}
                </div>
              ))}
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">Skills</h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {((skills ?? []) as SKILLS_QUERYResult)
              .filter(
                (s) => typeof s?.name === "string" && s.name.trim().length > 0,
              )
              .slice(0, 24)
              .map((s) => (
                <span
                  key={s._id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
                >
                  {s.name}
                </span>
              ))}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-white/80">
              Edit content in{" "}
              <a
                className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                href="/studio"
              >
                Studio
              </a>
              .
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
