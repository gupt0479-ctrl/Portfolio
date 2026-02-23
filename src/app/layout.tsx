import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { draftMode } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { HeaderScrolling } from "@/components/HeaderScrolling";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";
import ObsidianBackground from "@/components/three/ObsidianBackground";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ subsets: ["latin"] });

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
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-transparent text-white antialiased`}
        >
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
            <body className="min-h-screen bg-transparent text-white">
              <div className="fixed inset-0 -z-10 pointer-events-none">
                <ObsidianBackground />
              </div>
              <HeaderScrolling />
              {children}
              <SanityLive />
              <DraftModeHandler />
            </body>
          </ThemeProvider>
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
