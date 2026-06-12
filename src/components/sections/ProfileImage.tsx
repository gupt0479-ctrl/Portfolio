"use client";

import { FlaskConical, X } from "lucide-react";
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleSidebar}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={open ? "Close Portfolio Lab" : "Open Portfolio Lab"}
        className="float-btn relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      >
        <Image
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          fill
          priority
          className="object-cover transition-transform duration-300"
        />

        {/* Hover overlay */}
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
              <FlaskConical className="mx-auto mb-3 h-10 w-10 text-violet-300" />
            )}
            <div className="text-lg font-semibold text-white">
              {open ? "Close Lab" : "Open Portfolio Lab"}
            </div>
            <div className="mt-1 text-sm text-white/70 font-sans">
              {open ? "Click to close" : "Ask the lab, not my sleep schedule."}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
