"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { PROFILE_QUERYResult } from "@/sanity/types";
import { ProfileImage } from "./ProfileImage";
import { LayoutTextFlip } from "../ui/layout-text-flip";

type Profile = NonNullable<PROFILE_QUERYResult>;

interface SocialLink {
  icon: string;
  label: string;
  url: string;
}

export function HeroContent({
  profile,
  profileImageUrl,
}: {
  profile: Profile;
  profileImageUrl: string | null;
}) {
  const name = profile.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : "Anant Gupta";

  const words = profile.headlineAnimatedWords?.length
    ? (profile.headlineAnimatedWords.filter(Boolean) as string[])
    : ["scalable systems", "AI products", "clean UIs", "fast web apps"];

  // Social links - configure these with your actual URLs
  const socials: SocialLink[] = [
    { icon: "𝕏", label: "Twitter", url: "https://twitter.com" },
    { icon: "⚡", label: "GitHub", url: "https://github.com" },
    { icon: "🔗", label: "LinkedIn", url: "https://linkedin.com" },
    { icon: "✉️", label: "Email", url: "mailto:your@email.com" },
  ];

  return (
    <section
      id="home"
      className="relative min-h-[88vh] overflow-hidden bg-transparent flex items-center"
    >
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-xs font-medium tracking-[0.2em] text-white/60"
            >
              NEXT.JS • SANITY • 3D • TYPESCRIPT
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.03 }}
              className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-4 text-xl sm:text-2xl text-white/80"
            >
              <LayoutTextFlip
                text={profile.headlineStaticText || "I build"}
                words={words}
                duration={profile.headlineAnimationDuration || 2600}
              />
            </motion.div>

            {profile.shortBio && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.11 }}
                className="mt-4 max-w-2xl text-base leading-relaxed text-white/70"
              >
                {profile.shortBio}
              </motion.p>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="#projects"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                View Projects
              </Link>
              <Link
                href="/studio"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Edit Content
              </Link>
              {profile.email && (
                <Link
                  href={`mailto:${profile.email}`}
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Contact
                </Link>
              )}
            </motion.div>

            {/* Location & Status */}
            {(profile.location || profile.availability) && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.17 }}
                className="mt-6 flex flex-wrap gap-4 text-sm text-white/60"
              >
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    {profile.location}
                  </div>
                )}
                {profile.availability && (
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    {profile.availability}
                  </div>
                )}
              </motion.div>
            )}

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-8 flex gap-4"
            >
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  title={social.label}
                  className="h-10 w-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/40 transition"
                >
                  {social.icon}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right: Profile Image */}
          {profileImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="hidden lg:flex lg:justify-end"
            >
              <div className="h-80 w-80 lg:h-96 lg:w-96">
                <ProfileImage
                  imageUrl={profileImageUrl}
                  firstName={profile.firstName || ""}
                  lastName={profile.lastName || ""}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
