"use client";

import type { LucideIcon } from "lucide-react";
import { Github, Globe, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import { motion } from "motion/react";
import { useIridescentEffect } from "@/hooks/useIridescentEffect";
import type { PROFILE_QUERYResult } from "@/sanity/types";
import { LayoutTextFlip } from "../ui/layout-text-flip";
import { ProfileImage } from "./ProfileImage";

type Profile = NonNullable<PROFILE_QUERYResult>;

type SocialLink = {
  label: string;
  url: string;
  Icon: LucideIcon;
};

type SocialLinkDefinition = {
  label: string;
  url: string | null | undefined;
  Icon: LucideIcon;
};

const CTA_BUTTONS = [
  { label: "View Projects", href: "#projects", primary: true },
  { label: "View Experience", href: "#experience", primary: false },
  { label: "Contact", href: "#contact", primary: false },
] as const;

function IridCTA({
  href,
  primary,
  children,
  style,
}: {
  href: string;
  primary: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { ref } = useIridescentEffect({ gradientAlpha: 0.14 });
  return (
    <div
      ref={ref}
      className="relative inline-flex overflow-hidden rounded-full"
      style={style}
    >
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-full"
        style={{ background: "var(--irid-bg, transparent)" }}
        aria-hidden
      />
      <a
        href={href}
        className={
          primary
            ? "float-btn relative z-20 rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
            : "float-btn relative z-20 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:border-white/25 hover:bg-white/10 transition-colors duration-200"
        }
      >
        {children}
      </a>
    </div>
  );
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

  const socialDefinitions: SocialLinkDefinition[] = [
    { label: "GitHub", url: profile.socialLinks?.github, Icon: Github },
    { label: "LinkedIn", url: profile.socialLinks?.linkedin, Icon: Linkedin },
    { label: "Twitter/X", url: profile.socialLinks?.twitter, Icon: Twitter },
    { label: "Website", url: profile.socialLinks?.website, Icon: Globe },
    {
      label: "Email",
      url: profile.email ? `mailto:${profile.email}` : null,
      Icon: Mail,
    },
  ];

  const socials: SocialLink[] = socialDefinitions.filter(
    (social): social is SocialLink => Boolean(social.url),
  );

  return (
    <section
      id="home"
      className="relative min-h-[88vh] overflow-hidden bg-transparent flex items-center"
    >
      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="section-kicker">{"// hi, I'm"}</p>

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
                className="mt-4 max-w-xl text-base leading-relaxed text-white/70 line-clamp-3"
              >
                {profile.shortBio}
              </motion.p>
            )}

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {CTA_BUTTONS.map(({ label, href, primary }, idx) => (
                <IridCTA
                  key={label}
                  href={href}
                  primary={primary}
                  style={
                    { "--float-delay": `${idx * 200}ms` } as React.CSSProperties
                  }
                >
                  {label}
                </IridCTA>
              ))}
            </motion.div>

            {/* Social icons — above location/availability */}
            {socials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.17 }}
                className="mt-6 flex gap-3"
              >
                {socials.map(({ label, url, Icon }, idx) => (
                  <a
                    key={label}
                    href={url}
                    target={url.startsWith("mailto:") ? undefined : "_blank"}
                    rel={
                      url.startsWith("mailto:")
                        ? undefined
                        : "noopener noreferrer"
                    }
                    title={label}
                    aria-label={label}
                    className="float-btn flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 transition-colors duration-200 hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
                    style={
                      {
                        "--float-delay": `${600 + idx * 200}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <Icon className="h-[15px] w-[15px]" />
                  </a>
                ))}
              </motion.div>
            )}

            {/* Location + availability — below socials */}
            {(profile.location || profile.availability) && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="mt-4 flex flex-wrap gap-4 text-sm text-white/60"
              >
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-white/40" />
                    {profile.location}
                  </div>
                )}
                {profile.availability && (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    {profile.availability}
                  </div>
                )}
              </motion.div>
            )}
          </div>

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
