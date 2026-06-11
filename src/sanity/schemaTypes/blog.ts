import { ComposeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const blog = defineType({
  name: "blog",
  title: "Reading & Resources",
  type: "document",
  icon: ComposeIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Short note on why this resource is worth reading.",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "externalUrl",
      title: "External Link",
      type: "url",
      description: "URL to the article, documentation, or resource.",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "category",
      type: "string",
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "readTime",
      type: "number",
      description: "Optional estimated read time in minutes.",
    }),
    defineField({
      name: "featuredImage",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "featuredImage",
    },
  },
});
