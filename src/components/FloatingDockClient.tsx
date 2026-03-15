"use client";

import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

interface NavLink {
  id: string;
  title: string;
  href: string;
}

interface FloatingDockClientProps {
  links: NavLink[];
}

export function FloatingDockClient({ links }: FloatingDockClientProps) {
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  if (isSidebarOpen) return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-background/80 backdrop-blur-md px-4 py-2 shadow-lg">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {link.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
