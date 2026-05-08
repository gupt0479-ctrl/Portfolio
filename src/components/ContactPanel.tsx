"use client";

import { Clipboard, Github, Globe, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
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
  const isMail = href.startsWith("mailto:");

  return (
    <div
      ref={ref}
      className="relative inline-flex overflow-hidden rounded-full"
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
        className="float-btn relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/75 hover:text-white"
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
    <section id="contact" className="section-backdrop mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="section-kicker">// uplink</p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
          Let&apos;s build something
        </h2>
        <p className="mt-2 text-base text-white/45 font-sans">
          Internships, collaborations, or just to say hi.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <CometCard variant="subtle" rotateDepth={8} translateDepth={10}>
          <div className="relative overflow-hidden rounded-xl cosmic-card p-6 text-center">
            {email ? (
              <div>
                <p className="text-xs text-white/35 font-mono uppercase tracking-widest mb-2">
                  Email
                </p>
                <p className="text-lg text-white/85 font-medium font-sans">{email}</p>
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label="Copy email"
                    className="float-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-white/60 hover:text-white/90 transition-colors"
                  >
                    <Clipboard className="size-[13px]" strokeWidth={1.75} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={`mailto:${email}`}
                    className="float-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-white/60 hover:text-white/90 transition-colors"
                  >
                    <Mail className="size-[13px]" strokeWidth={1.75} />
                    Open Mail
                  </a>
                </div>
              </div>
            ) : null}

            {profile?.location ? (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/40 font-sans">
                <MapPin className="size-[13px] shrink-0 text-white/35" />
                {profile.location}
              </p>
            ) : null}

            <div className="my-5 border-t border-white/[0.06]" />

            <div className="flex justify-center gap-3 flex-wrap">
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
        </CometCard>
      </div>
    </section>
  );
}
