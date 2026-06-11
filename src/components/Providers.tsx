"use client";

import { ChatTokenInit } from "@/components/ChatTokenInit";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ChatTokenInit />
      {children}
    </ThemeProvider>
  );
}
