"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

function SidebarToggle() {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  const { isSignedIn } = useUser();

  const isSidebarOpen = isMobile ? openMobile : open;

  if (isSidebarOpen) return null;

  const buttonStyles =
    "relative w-12 h-12 rounded-full " +
    "bg-black/60 border border-white/20 backdrop-blur-sm " +
    "hover:bg-white/[0.08] hover:border-white/30 " +
    "transition-all duration-300 " +
    "flex items-center justify-center " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30";

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-xl border border-white/15 text-xs font-sans text-white/80 whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-0.5 transition-all duration-200 pointer-events-none">
        Chat with AI Twin
        <div className="absolute -bottom-1 right-5 w-2 h-2 rotate-45 bg-black/80 border-r border-b border-white/15" />
      </div>

      {isSignedIn ? (
        <button
          type="button"
          onClick={toggleSidebar}
          className={buttonStyles}
          aria-label="Chat with AI Twin"
        >
          <MessageSquare className="h-5 w-5 text-white/60 group-hover:text-white/90 transition-colors duration-200" />
        </button>
      ) : (
        <SignInButton mode="modal">
          <button
            type="button"
            className={buttonStyles}
            aria-label="Sign in to chat with AI Twin"
          >
            <MessageSquare className="h-5 w-5 text-white/60 group-hover:text-white/90 transition-colors duration-200" />
          </button>
        </SignInButton>
      )}
    </div>
  );
}

export default SidebarToggle;
