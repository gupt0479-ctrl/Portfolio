"use client";

import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/DarkModeToggle";
import { useSidebar } from "@/components/ui/sidebar";
import { useShowOnScroll } from "@/hooks/useShowOnScroll";

type NavItem = {
  _id: string;
  title: string;
  href: string;
  isExternal?: boolean;
};

interface HeaderScrollingProps {
  nav?: NavItem[];
}

const CORE_NAV: NavItem[] = [
  { _id: "h", title: "Home", href: "#home" },
  { _id: "ab", title: "About", href: "#about" },
  { _id: "ex", title: "Experience", href: "#experience" },
  { _id: "pr", title: "Projects", href: "#projects" },
  { _id: "sk", title: "Skills", href: "#skills" },
  { _id: "ed", title: "Education", href: "#education" },
  { _id: "ce", title: "Certifications", href: "#certifications" },
  { _id: "bl", title: "Blog", href: "#blog" },
  { _id: "co", title: "Contact", href: "#contact" },
];

const TOGGLE_3D_HOVER = {
  transform: "perspective(600px) rotateX(8deg) translateY(-4px) scale(1.03)",
  boxShadow: "0 4px 12px rgba(255,255,255,0.08)",
} as const;

const TOGGLE_3D_RESET = {
  transform: "none",
  boxShadow: "none",
} as const;

export function HeaderScrolling({ nav = [] }: HeaderScrollingProps) {
  const show = useShowOnScroll(80);
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;
  const [toggleHovered, setToggleHovered] = useState(false);

  const items = CORE_NAV.map(
    (fallbackItem) =>
      nav.find((item) => item.href.toLowerCase() === fallbackItem.href) ??
      fallbackItem,
  );

  return (
    <header
      style={{
        right: !isMobile && isSidebarOpen ? "var(--sidebar-width, 25rem)" : "0",
        transition:
          "right 220ms cubic-bezier(0.4,0,0.2,1), transform 500ms ease-out, opacity 500ms ease-out",
      }}
      className={[
        "fixed left-0 top-0 z-50",
        "border-b border-white/[0.06] backdrop-blur-xl bg-[#07070d]/85",
        show
          ? "translate-y-0 opacity-100 shadow-[0_1px_40px_rgba(0,0,0,0.55)]"
          : "-translate-y-full opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="flex w-full items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="#home"
          className="shrink-0 select-none text-sm font-bold tracking-tight text-white"
        >
          Anant<span className="text-violet-400">.</span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden"
          aria-label="Main navigation"
        >
          {items.map((item) => (
            <Link
              key={item._id}
              href={item.href}
              className="group relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white/45 transition-colors duration-200 hover:text-white/90"
            >
              {item.title}
              <span
                className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-[60%]"
                style={{
                  background: "rgba(167,139,250,0.9)",
                  boxShadow:
                    "0 0 8px rgba(167,139,250,0.8), 0 0 18px rgba(167,139,250,0.4)",
                }}
              />
            </Link>
          ))}
        </nav>

        {/* role="none" — purely cosmetic 3D hover wrapper; interaction is on the inner ModeToggle button */}
        <div
          role="none"
          className="ml-auto shrink-0"
          style={{
            transition: "transform 180ms ease, box-shadow 180ms ease",
            willChange: "transform",
            ...(toggleHovered ? TOGGLE_3D_HOVER : TOGGLE_3D_RESET),
          }}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
        >
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
