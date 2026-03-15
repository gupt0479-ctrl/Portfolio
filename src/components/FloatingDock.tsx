import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { FloatingDockClient } from "./FloatingDockClient";

const FLOATING_NAV_QUERY = defineQuery(`
  *[_type == "navigation"] | order(order asc){ _id, title, href, isExternal, order }
`);

export async function FloatingDock() {
  const { data: links } = await sanityFetch({ query: FLOATING_NAV_QUERY });

  const navLinks = links?.length
    ? links.map((l) => ({
        id: l._id ?? l.href ?? "",
        title: l.title ?? "",
        href: l.href ?? "#",
      }))
    : [
        { id: "home", title: "Home", href: "#hero" },
        { id: "about", title: "About", href: "#about" },
        { id: "skills", title: "Skills", href: "#skills" },
        { id: "experience", title: "Experience", href: "#experience" },
        { id: "projects", title: "Projects", href: "#projects" },
        { id: "contact", title: "Contact", href: "#contact" },
      ];

  return <FloatingDockClient links={navLinks} />;
}
