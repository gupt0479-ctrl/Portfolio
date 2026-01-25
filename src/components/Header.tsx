"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/DarkModeToggle";

type NavItem = {
  _id: string;
  title: string;
  href: string;
  isExternal?: boolean;
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5">
      <span
        className={[
          "absolute left-0 top-0 block h-0.5 w-5 rounded bg-white/80 transition-transform",
          open ? "translate-y-1.75 rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-1.75 block h-0.5 w-5 rounded bg-white/80 transition-opacity",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-3.5 block h-0.5 w-5 rounded bg-white/80 transition-transform",
          open ? "-translate-y-1.75 -rotate-45" : "",
        ].join(" ")}
      />
    </span>
  );
}

export default function Header({ nav = [] }: { nav?: NavItem[] }) {
  const fallback: NavItem[] = [
    { _id: "p", title: "Projects", href: "#projects" },
    { _id: "e", title: "Experience", href: "#experience" },
    { _id: "s", title: "Skills", href: "#skills" },
    { _id: "c", title: "Contact", href: "#contact" },
    { _id: "st", title: "Studio", href: "/studio" },
  ];

  const items = nav.length ? nav : fallback;

  const sectionIds = useMemo(
    () =>
      items
        .map((i) => i.href)
        .filter((h) => h.startsWith("#"))
        .map((h) => h.slice(1)),
    [items],
  );

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          )[0];
        if (visible?.target?.id) setActive(`#${visible.target.id}`);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5],
        rootMargin: "-10% 0px -60% 0px",
      },
    );

    nodes.forEach((n) => {
      obs.observe(n);
    });
    return () => obs.disconnect();
  }, [sectionIds]);

  function onNavClick(href: string) {
    setOpen(false);
    if (!href.startsWith("#")) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-white/10 backdrop-blur",
        scrolled ? "bg-black/70" : "bg-black/40",
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-white"
        >
          Anant
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {items.map((i) => {
            const cls =
              "text-sm transition-colors " +
              (active === i.href
                ? "text-white"
                : "text-white/70 hover:text-white");
            return i.isExternal ? (
              <a
                key={i._id}
                href={i.href}
                target="_blank"
                rel="noreferrer"
                className={cls}
              >
                {i.title}
              </a>
            ) : i.href.startsWith("#") ? (
              <button
                key={i._id}
                type="button"
                onClick={() => onNavClick(i.href)}
                className={cls}
              >
                {i.title}
              </button>
            ) : (
              <Link key={i._id} href={i.href} className={cls}>
                {i.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <div className="hidden md:flex">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-black/85 backdrop-blur md:hidden">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex flex-col gap-2">
              {items.map((i) =>
                i.isExternal ? (
                  <a
                    key={i._id}
                    href={i.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {i.title}
                  </a>
                ) : i.href.startsWith("#") ? (
                  <button
                    key={i._id}
                    type="button"
                    onClick={() => onNavClick(i.href)}
                    className="text-left rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    {i.title}
                  </button>
                ) : (
                  <Link
                    key={i._id}
                    href={i.href}
                    className="rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {i.title}
                  </Link>
                ),
              )}

              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
