"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { PROFILE_QUERYResult } from "@/sanity/types";
import { ProfileImage } from "./ProfileImage";

type Profile = NonNullable<PROFILE_QUERYResult>;

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

  const headline =
    profile.headline ??
    "Full-stack developer building premium web + AI experiences.";

  return (
    <section
      id="home"
      className="relative min-h-[88vh] overflow-hidden bg-black"
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

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-4 max-w-3xl text-xl leading-snug text-white/80 sm:text-2xl"
            >
              <span className="bg-gradient-to-r from-violet-300 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
                {headline}
              </span>
            </motion.p>

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

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="mt-9 flex flex-wrap items-center gap-3"
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
          </div>

          {profileImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex lg:justify-end"
            >
              <div className="relative h-72 w-72 overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
                <Image
                  src={profileImageUrl}
                  alt={`${name} profile photo`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 384px, (min-width: 640px) 320px, 288px"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
