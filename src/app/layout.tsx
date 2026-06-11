import { ClerkProvider } from "@clerk/nextjs";
import { Lora, Ubuntu } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { clerkAppearance } from "@/lib/clerk-appearance";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${ubuntu.variable} ${lora.variable} min-h-screen overflow-x-hidden bg-[#07070d] antialiased`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
