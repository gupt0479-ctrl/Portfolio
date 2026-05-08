"use client";

import Link from "next/link";
import { Menu, Moon, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { useShowOnScroll } from "@/hooks/useShowOnScroll";
import { useActiveSection } from "@/hooks/useActiveSection";

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

export function HeaderScrolling({ nav = [] }: HeaderScrollingProps) {
  const show = useShowOnScroll(80);
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;
  const activeSection = useActiveSection();

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
        "cosmic-card rounded-none border-x-0 border-t-0 border-b border-violet-500/20 backdrop-blur-xl",
        show
          ? "translate-y-0 opacity-100 shadow-[0_1px_40px_rgba(0,0,0,0.55),0_1px_0_rgba(139,92,246,0.15)]"
          : "-translate-y-full opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="flex w-full items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="#home"
          className="shrink-0 select-none text-sm font-bold tracking-tight text-white"
        >
          Anant<span className="text-violet-400">.</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden"
          aria-label="Main navigation"
        >
          {items.map((item) => {
            const sectionId = item.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <Link
                key={item._id}
                href={item.href}
                className={[
                  "group relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-200",
                  isActive
                    ? "text-white/90"
                    : "text-white/45 hover:text-white/90",
                ].join(" ")}
              >
                {item.title}
                <span
                  className={[
                    "absolute bottom-1 left-1/2 h-px -translate-x-1/2 rounded-full transition-all duration-300",
                    isActive ? "w-[60%]" : "w-0 group-hover:w-[60%]",
                  ].join(" ")}
                  style={{
                    background: "rgba(167,139,250,0.9)",
                    boxShadow:
                      "0 0 8px rgba(167,139,250,0.8), 0 0 18px rgba(167,139,250,0.4)",
                  }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Dark mode indicator */}
        <div className="ml-auto shrink-0 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/50">
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="float-btn p-2 rounded-lg border border-white/10 bg-white/5"
                aria-label="Open navigation"
              >
                <Menu className="size-5 text-white/70" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="cosmic-card border-l border-white/[0.06] w-72 p-0"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06]">
                <span className="text-sm font-bold tracking-tight text-white">
                  Anant<span className="text-violet-400">.</span>
                </span>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/[0.06] transition-colors"
                    aria-label="Close navigation"
                  >
                    <X className="size-4" />
                  </button>
                </SheetClose>
              </div>
              <nav
                className="flex flex-col gap-1 px-3 py-4"
                aria-label="Mobile navigation"
              >
                {items.map((item) => {
                  const sectionId = item.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <SheetClose asChild key={item._id}>
                      <Link
                        href={item.href}
                        className={[
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                          isActive
                            ? "text-white bg-white/[0.06] border border-violet-500/20"
                            : "text-white/60 hover:text-white hover:bg-white/[0.04]",
                        ].join(" ")}
                      >
                        {isActive && (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background: "rgba(167,139,250,0.9)",
                              boxShadow: "0 0 6px rgba(167,139,250,0.8)",
                            }}
                          />
                        )}
                        {item.title}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-auto px-5 pb-5 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-white/30">
                  <Moon className="h-3 w-3" />
                  <span>Dark mode</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
