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
        first.includes("does not recognize the `disableTransition` prop")
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
