"use client";

import { NextStudio } from "next-sanity/studio";
import { useEffect } from "react";
import config from "../../../../sanity.config";

export default function StudioClient() {
  useEffect(() => {
    const originalError = console.error;

    console.error = (...args: unknown[]) => {
      const first = args[0];
      if (
        typeof first === "string" &&
        first.includes("React does not recognize the") &&
        first.includes("disableTransition")
      ) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <NextStudio config={config} />;
}
