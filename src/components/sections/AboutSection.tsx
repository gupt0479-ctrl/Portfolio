import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { defineQuery } from "next-sanity";
import { AboutTelemetry } from "@/components/AboutTelemetry";
import { HeroTerminal } from "@/components/HeroTerminal";
import { sanityFetch } from "@/sanity/lib/live";

const ABOUT_QUERY = defineQuery(`
  coalesce(
    *[_type == "profile" && _id == "singleton-profile"][0],
    *[_type == "profile"][0]
  ){
    firstName,
    lastName,
    fullBio,
    yearsOfExperience,
    stats,
    email,
    phone,
    location
  }
`);

export async function AboutSection() {
  const { data: profile } = await sanityFetch({ query: ABOUT_QUERY });

  if (!profile) {
    return null;
  }

  return (
    <section id="about" className="section-backdrop py-16 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="section-kicker">{"// scan report"}</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
            About Me
          </h2>
          <p className="text-lg text-white/50 font-sans">
            A quick system scan.
          </p>
        </div>

        {/* Bio */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {profile.fullBio && (
            <PortableText
              value={profile.fullBio}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="text-white/65 leading-relaxed mb-4 font-sans">
                      {children}
                    </p>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-display font-bold mt-8 mb-4 text-white">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-display font-semibold mt-6 mb-3 text-white">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-violet-500/50 pl-4 italic my-4 text-white/55">
                      {children}
                    </blockquote>
                  ),
                },
                marks: {
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-white/80">{children}</em>
                  ),
                  link: ({ children, value }) => {
                    const href = value?.href || "";
                    const isExternal = href.startsWith("http");
                    return (
                      <Link
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="text-violet-300 hover:text-violet-200 underline underline-offset-2"
                      >
                        {children}
                      </Link>
                    );
                  },
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-white/60 font-sans">
                      {children}
                    </ul>
                  ),
                  number: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-white/60 font-sans">
                      {children}
                    </ol>
                  ),
                },
              }}
            />
          )}
        </div>

        {/* Telemetry stats */}
        {profile.stats && profile.stats.length > 0 && (
          <AboutTelemetry stats={profile.stats} />
        )}

        {/* Terminal snapshot */}
        <div className="mt-10 flex justify-center">
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}
