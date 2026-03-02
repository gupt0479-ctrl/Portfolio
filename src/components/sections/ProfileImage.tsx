"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export function ProfileImage({
  imageUrl,
  firstName,
  lastName,
}: {
  imageUrl: string;
  firstName: string;
  lastName: string;
}) {
  const [hovered, setHovered] = useState(false);
  const { toggleSidebar, open } = useSidebar();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  return (
    <button
      type="button"
      onClick={() => (isSignedIn ? toggleSidebar() : openSignIn())}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Toggle AI Chat Sidebar"
      className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
    >
      <Image
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        fill
        priority
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-xs font-medium text-white">Online</span>
      </div>

      <div
        className={[
          "absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <div className="text-center">
          {open ? (
            <X className="mx-auto mb-3 h-10 w-10 text-white" />
          ) : (
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-white" />
          )}

          <div className="text-lg font-semibold text-white">
            {open ? "Close Chat" : "Chat with AI Twin"}
          </div>
          <div className="mt-1 text-sm text-white/80">
            {open ? "Click to close chat" : "Click to open chat"}
          </div>
        </div>
      </div>
    </button>
  );
}
