import { sanityFetch } from "@/sanity/lib/live";
import { NAVIGATION_QUERY } from "@/sanity/lib/queries";
import { FloatingDockClient } from "./FloatingDockClient";

const DEFAULT_NAV_LINKS = [
  { id: "home", title: "Home", href: "#home" },
  { id: "about", title: "About", href: "#about" },
  { id: "skills", title: "Skills", href: "#skills" },
  { id: "experience", title: "Experience", href: "#experience" },
  { id: "projects", title: "Projects", href: "#projects" },
  { id: "contact", title: "Contact", href: "#contact" },
] as const;

const ALLOWED_SECTION_HREFS = new Set(
  DEFAULT_NAV_LINKS.map((link) => link.href.toLowerCase()),
);

export async function FloatingDock() {
  const { data: links } = await sanityFetch({ query: NAVIGATION_QUERY });

  const filteredLinks =
    links
      ?.filter((link) =>
        ALLOWED_SECTION_HREFS.has((link.href ?? "").toLowerCase()),
      )
      .map((link) => ({
        id: link._id ?? link.href ?? "",
        title: link.title ?? "",
        href: link.href ?? "#",
      })) ?? [];

  const navLinks = filteredLinks.length
    ? filteredLinks
    : DEFAULT_NAV_LINKS.map((link) => ({ ...link }));

  return <FloatingDockClient links={navLinks} />;
}
