"use client";

import { motion } from "framer-motion";
import Hero3DBackground from "@/components/Hero3DBackground";

type Profile = {
  firstName?: string;
  lastName?: string;
  headline?: string;
};

export function Hero3D({ profile }: { profile: Profile | null }) {
  const name =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    "Anant Gupta";

  const headline =
    profile?.headline ||
    "Full-stack developer building premium web + AI experiences.";

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-black">
      <Hero3DBackground />

      <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 pt-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm tracking-wide text-white/60"
        >
          Next.js • Sanity • AI • 3D Web
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-6xl"
        >
          {name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 max-w-2xl text-xl leading-snug text-white/75 sm:text-2xl"
        >
          <span className="bg-linear-to-r from-violet-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            {headline}
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a
            href="#projects"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black"
          >
            View Projects
          </a>
          <a
            href="/studio"
            className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/5"
          >
            Edit Content
          </a>
        </motion.div>
      </div>
    </section>
  );
}
