"use client";

import { FlaskConical } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

function SidebarToggle() {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  return (
    <div
      className="fixed bottom-8 right-8 z-50"
      style={{
        right:
          !isMobile && isOpen
            ? "calc(var(--sidebar-width, 25rem) + 2rem)"
            : "2rem",
        transition: "right 220ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open Portfolio Lab"
        title="Ask the lab, not my sleep schedule."
        className={[
          "float-btn flex h-14 w-14 items-center justify-center rounded-full",
          "border border-violet-500/30 bg-[#0d0d1a] text-violet-300/80",
          "hover:text-violet-200 hover:border-violet-400/50 hover:bg-[#12122a]",
          "transition-colors duration-200",
          "animate-[pulse-glow_3s_ease-in-out_infinite]",
        ].join(" ")}
      >
        <FlaskConical className="size-6" />
      </button>
    </div>
  );
}

export default SidebarToggle;
