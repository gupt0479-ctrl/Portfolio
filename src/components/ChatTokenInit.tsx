"use client";

import { useEffect } from "react";

export function ChatTokenInit() {
  useEffect(() => {
    fetch("/api/chat-token", { credentials: "same-origin" }).catch(() => {});
  }, []);

  return null;
}
