"use client";

import { Clipboard, Github, Globe, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CometCard } from "@/components/ui/comet-card";
import { useIridescentEffect } from "@/lib/hooks/useIridescentEffect";

type SocialLinks = {
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  website?: string | null;
};

export type ContactProfile = {
  email?: string | null;
  location?: string | null;
  socialLinks?: SocialLinks | null;
};

function social3d(hovered: boolean): CSSProperties {
  return {
    transition: "transform 180ms ease, box-shadow 180ms ease",
    willChange: "transform",
    transform: hovered
      ? "perspective(600px) rotateX(8deg) translateY(-4px) scale(1.03)"
      : "none",
    boxShadow: hovered ? "0 8px 20px rgba(167,139,250,0.15)" : "none",
  };
}

function IridSocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const { ref, overlayStyle } = useIridescentEffect({ gradientAlpha: 0.12 });
  const [hovered, setHovered] = useState(false);
  const isMail = href.startsWith("mailto:");

  return (
    <div
      ref={ref}
      className="relative inline-flex overflow-hidden rounded-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="pointer-events-none absolute inset-0 z-[1] rounded-full"
        style={overlayStyle}
        aria-hidden
      />
      <a
        href={href}
        target={isMail ? undefined : "_blank"}
        rel={isMail ? undefined : "noopener noreferrer"}
        aria-label={label}
        style={social3d(hovered)}
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/75 hover:text-white"
      >
        {children}
      </a>
    </div>
  );
}

export function ContactPanel({ profile }: { profile: ContactProfile | null }) {
  const email = profile?.email?.trim() ?? "";
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const copyEmail = useCallback(async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [email]);

  const s = profile?.socialLinks;

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
          Tired of chatting to my AI Twin?
        </h2>
        <p className="mt-2 text-base text-white/45 font-sans">
          I&apos;m a real person. Reach out directly.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <CometCard rotateDepth={10} translateDepth={12}>
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
            {email ? (
              <div>
                <p className="text-xs text-white/35 font-mono uppercase tracking-widest mb-1">
                  Email
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg text-white/85 font-medium font-sans">
                    {email}
                  </p>
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label="Copy email"
                    className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors"
                  >
                    <Clipboard className="size-[15px]" strokeWidth={1.75} />
                  </button>
                  {copied ? (
                    <span className="text-xs text-violet-300 font-sans">
                      Copied!
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {profile?.location ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-white/40 font-sans">
                <MapPin className="size-[13px] shrink-0 text-white/35" />
                {profile.location}
              </p>
            ) : null}

            <div className="my-6 border-t border-white/[0.08]" />

            <div>
              <p className="text-xs text-white/35 font-mono uppercase tracking-widest mb-3">
                Connect
              </p>
              <div className="flex flex-wrap gap-2">
                {s?.github ? (
                  <IridSocialButton href={s.github} label="GitHub">
                    <Github className="size-4" />
                  </IridSocialButton>
                ) : null}
                {s?.linkedin ? (
                  <IridSocialButton href={s.linkedin} label="LinkedIn">
                    <Linkedin className="size-4" />
                  </IridSocialButton>
                ) : null}
                {s?.twitter ? (
                  <IridSocialButton href={s.twitter} label="Twitter / X">
                    <Twitter className="size-4" />
                  </IridSocialButton>
                ) : null}
                {s?.website ? (
                  <IridSocialButton href={s.website} label="Website">
                    <Globe className="size-4" />
                  </IridSocialButton>
                ) : null}
                {email ? (
                  <IridSocialButton href={`mailto:${email}`} label="Email">
                    <Mail className="size-4" />
                  </IridSocialButton>
                ) : null}
              </div>
            </div>
          </div>
        </CometCard>
      </div>
    </section>
  );
}
