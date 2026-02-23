"use client";

import Link from "next/link";
import { useShowOnScroll } from "@/hooks/useShowOnScroll";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/DarkModeToggle";

type NavItem = {
  _id: string;
  title: string;
  href: string;
  isExternal?: boolean;
};

interface HeaderScrollingProps {
  nav?: NavItem[];
}

export function HeaderScrolling({ nav = [] }: HeaderScrollingProps) {
  const show = useShowOnScroll(80);

  const fallback: NavItem[] = [
    { _id: "p", title: "Projects", href: "#projects" },
    { _id: "e", title: "Experience", href: "#experience" },
    { _id: "s", title: "Skills", href: "#skills" },
    { _id: "c", title: "Contact", href: "#contact" },
  ];

  const items = nav.length ? nav : fallback;

  return (
    <header
      className={`
        fixed left-0 right-0 top-0 z-40
        transition-all duration-500 ease-out
        border-b border-white/10 backdrop-blur-md bg-black/30
        ${
          show
            ? "translate-y-0 opacity-100 shadow-lg"
            : "-translate-y-full opacity-0 pointer-events-none"
        }
      `}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white">
          Anant
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          {items.map((item) =>
            item.isExternal ? (
              <a
                key={item._id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-white transition"
              >
                {item.title}
              </a>
            ) : (
              <a
                key={item._id}
                href={item.href}
                className="text-white/70 hover:text-white transition"
              >
                {item.title}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
