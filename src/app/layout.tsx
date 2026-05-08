import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Lora, Ubuntu } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import Providers from "@/components/Providers";
import SidebarToggle from "@/components/SidebarToggle";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anant Gupta | Portfolio",
  description: "Full-stack developer portfolio with Sanity, Portfolio Lab, and 3D web.",
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
          className={`${ubuntu.variable} ${lora.variable} min-h-screen overflow-x-hidden bg-[#07070d] antialiased`}
        >
          <Providers>
            <div className="flex min-h-svh w-full overflow-x-hidden">
              <main className="relative min-w-0 flex-1">{children}</main>
              <AppSidebar side="right" />
            </div>
            <SidebarToggle />
          </Providers>
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
