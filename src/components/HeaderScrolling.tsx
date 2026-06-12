"use client";

import { Menu, Moon, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { useActiveSection } from "@/hooks/useActiveSection";
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

function isExternalHref(href: string, isExternal?: boolean) {
  return (
    isExternal === true || href.startsWith("http") || href.startsWith("mailto:")
  );
}

function buildNavItems(nav: NavItem[]) {
  const internalFromSanity = nav.filter(
    (item) => !isExternalHref(item.href, item.isExternal),
  );
  const externalItems = nav.filter((item) =>
    isExternalHref(item.href, item.isExternal),
  );

  const sectionItems =
    internalFromSanity.length > 0
      ? internalFromSanity
      : CORE_NAV.map(
          (fallbackItem) =>
            nav.find((item) => item.href.toLowerCase() === fallbackItem.href) ??
            fallbackItem,
        );

  return { sectionItems, externalItems };
}

function NavLink({
  item,
  isActive,
  className,
}: {
  item: NavItem;
  isActive: boolean;
  className: string;
}) {
  const external = isExternalHref(item.href, item.isExternal);

  if (external) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
        rel={
          item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
        }
        className={className}
      >
        {item.title}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
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
}

export function HeaderScrolling({ nav = [] }: HeaderScrollingProps) {
  const show = useShowOnScroll(80);
  useTheme();
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;
  const activeSection = useActiveSection();
  const { sectionItems, externalItems } = buildNavItems(nav);
  const allItems = [...sectionItems, ...externalItems];

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
          {allItems.map((item) => {
            const sectionId = item.href.replace("#", "");
            const isActive =
              !isExternalHref(item.href, item.isExternal) &&
              activeSection === sectionId;

            return (
              <NavLink
                key={item._id}
                item={item}
                isActive={isActive}
                className={[
                  "group relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-200",
                  isExternalHref(item.href, item.isExternal)
                    ? "text-white/40 hover:text-violet-300"
                    : isActive
                      ? "text-white/90"
                      : "text-white/45 hover:text-white/90",
                ].join(" ")}
              />
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            /* light mode not yet designed — wire setTheme('light') here later */
          }}
          aria-label="Color theme — dark mode active (light mode coming soon)"
          className="float-btn ml-auto hidden shrink-0 cursor-default items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 md:flex"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="float-btn rounded-lg border border-white/10 bg-white/5 p-2"
                aria-label="Open navigation"
              >
                <Menu className="size-5 text-white/70" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="cosmic-card w-72 border-l border-white/[0.06] p-0"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 pb-3 pt-5">
                <span className="text-sm font-bold tracking-tight text-white">
                  Anant<span className="text-violet-400">.</span>
                </span>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/90"
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
                {allItems.map((item) => {
                  const sectionId = item.href.replace("#", "");
                  const isActive =
                    !isExternalHref(item.href, item.isExternal) &&
                    activeSection === sectionId;
                  const external = isExternalHref(item.href, item.isExternal);

                  const linkClass = [
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "border border-violet-500/20 bg-white/[0.06] text-white"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white",
                  ].join(" ");

                  if (external) {
                    return (
                      <SheetClose asChild key={item._id}>
                        <a
                          href={item.href}
                          target={
                            item.href.startsWith("mailto:")
                              ? undefined
                              : "_blank"
                          }
                          rel={
                            item.href.startsWith("mailto:")
                              ? undefined
                              : "noopener noreferrer"
                          }
                          className={linkClass}
                        >
                          {item.title}
                        </a>
                      </SheetClose>
                    );
                  }

                  return (
                    <SheetClose asChild key={item._id}>
                      <Link href={item.href} className={linkClass}>
                        {isActive && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
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
              <div className="mt-auto border-t border-white/[0.06] px-5 pb-5 pt-3">
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
