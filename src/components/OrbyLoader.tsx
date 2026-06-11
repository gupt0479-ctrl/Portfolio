"use client";

import dynamic from "next/dynamic";

const Orby = dynamic(() => import("@/components/orby/Orby"), { ssr: false });

export function OrbyLoader() {
  return <Orby />;
}
