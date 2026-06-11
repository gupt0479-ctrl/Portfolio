import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatTokenInit } from "@/components/ChatTokenInit";
import { OrbyLoader } from "@/components/OrbyLoader";
import SidebarToggle from "@/components/SidebarToggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { urlFor } from "@/sanity/lib/image";
import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({ query: SITE_SETTINGS_QUERY });

  const title = settings?.siteTitle?.trim() || "Anant Gupta | Portfolio";
  const description =
    settings?.siteDescription?.trim() ||
    "Full-stack developer portfolio with Sanity, Portfolio Lab, and 3D web.";

  const ogImage = settings?.siteLogo
    ? urlFor(settings.siteLogo).width(1200).height(630).url()
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-svh w-full overflow-x-hidden">
        <main className="relative min-w-0 flex-1">{children}</main>
        <AppSidebar side="right" />
      </div>
      <SidebarToggle />
      <OrbyLoader />
      <ChatTokenInit />
      <SanityLive />
    </SidebarProvider>
  );
}
