"use client";

import dynamic from "next/dynamic";

const ObsidianBackground = dynamic(() => import("./ObsidianBackgroundCanvas"), {
  ssr: false,
});

export default ObsidianBackground;
