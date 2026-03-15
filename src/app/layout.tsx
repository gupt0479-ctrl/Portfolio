import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Script from "next/script";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import Providers from "@/components/Providers";
import SidebarToggle from "@/components/SidebarToggle";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} min-h-screen antialiased`}
        >
          <Script
            src="https://chatkit.studio/chatkit.js"
            strategy="afterInteractive"
          />
          <Providers>
            <div className="flex min-h-svh w-full">
              <AppSidebar side="right" />
              <main className="flex-1 relative">{children}</main>
            </div>
            <SidebarToggle />
          </Providers>
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
