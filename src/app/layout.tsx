import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SanityLive } from "@/sanity/lib/live";
import ObsidianBackground from "@/components/three/ObsidianBackground";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anant Gupta | Portfolio",
  description: "Full-stack developer portfolio with Sanity + AI Twin + 3D web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
        >
          <SidebarProvider>
            <SidebarInset />
            <Sidebar className="absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-black/60 p-2 text-white transition-opacity duration-200 hover:opacity-100 opacity-80" />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Script
                src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
                strategy="afterInteractive"
              />

              <div className="fixed inset-0 z-0 pointer-events-none">
                <ObsidianBackground />
              </div>

              <div className="relative z-10">{children}</div>
              <Script
                src="https://beaman.ai/scripts/chat.js"
                data-user-id="anantgupta"
                async
              />
              <SanityLive />
              <DraftModeHandler />
              <SidebarInset />
            </ThemeProvider>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

async function DraftModeHandler() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <>
      <VisualEditing />
      <DisableDraftMode />
    </>
  );
}
