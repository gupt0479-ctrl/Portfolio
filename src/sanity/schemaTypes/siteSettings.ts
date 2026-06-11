import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteTitle",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteDescription",
      type: "text",
      rows: 3,
      description:
        "Default meta description for SEO, link previews, and browser tab context.",
    }),
    defineField({
      name: "siteLogo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "showBlog",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "siteTitle",
      media: "siteLogo",
    },
  },
});
