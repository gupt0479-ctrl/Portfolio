import { StarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const achievement = defineType({
  name: "achievement",
  title: "Achievements & Awards",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Award", value: "award" },
          { title: "Hackathon Win", value: "hackathon" },
          { title: "Publication", value: "publication" },
          { title: "Speaking", value: "speaking" },
          { title: "Open Source", value: "open-source" },
          { title: "Milestone", value: "milestone" },
          { title: "Recognition", value: "recognition" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "issuer",
      type: "string",
    }),
    defineField({
      name: "date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "url",
      type: "url",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      issuer: "issuer",
      media: "image",
      type: "type",
      featured: "featured",
    },
    prepare({ title, issuer, media, type, featured }) {
      return {
        title: featured ? `⭐ ${title}` : title,
        subtitle: `${type} - ${issuer ?? "—"}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Featured First",
      name: "featuredFirst",
      by: [
        { field: "featured", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Newest First",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
