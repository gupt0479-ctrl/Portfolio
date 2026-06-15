"use client";

import type { ReactNode } from "react";
import { useSidebar } from "@/components/ui/sidebar";

const TRANSITION = "300ms cubic-bezier(0.4, 0, 0.2, 1)";

interface SidebarAwareContentProps {
  backgroundCanvas: ReactNode;
  children: ReactNode;
}

/**
 * Client wrapper that makes the background canvas respond to sidebar state.
 *
 * Canvas: uses width-based sizing (not right-edge clip) so the Three.js
 * sphere naturally centers in the visible viewport area when the sidebar
 * opens. The canvas shrinks to fill only the non-sidebar zone.
 *
 * Content: renders normally without any transform — the parent flex layout
 * in (portfolio)/layout.tsx already constrains the content to the available
 * space via `flex-1 min-w-0`. No translateX needed.
 */
export function SidebarAwareContent({
  backgroundCanvas,
  children,
}: SidebarAwareContentProps) {
  const { open, openMobile, isMobile } = useSidebar();
  const sidebarOpen = isMobile ? openMobile : open;

  // On mobile the sidebar is a sheet overlay — no layout shift needed
  const shouldShift = !isMobile && sidebarOpen;

  return (
    <>
      {/* Background canvas wrapper — width-based approach for natural centering */}
      <div
        className="fixed top-0 left-0 bottom-0 z-0 pointer-events-none"
        style={{
          width: shouldShift
            ? "calc(100vw - var(--sidebar-width, 25rem))"
            : "100vw",
          transition: `width ${TRANSITION}`,
        }}
      >
        {backgroundCanvas}
      </div>

      {/* Main content — no transform needed, flows naturally in flex layout */}
      {children}
    </>
  );
}
