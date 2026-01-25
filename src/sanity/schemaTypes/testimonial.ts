import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "position",
      type: "string",
    }),
    defineField({
      name: "company",
      type: "string",
    }),
    defineField({
      name: "testimonial",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      type: "number",
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: "date",
      type: "date",
    }),
    defineField({
      name: "avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "companyLogo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "linkedinUrl",
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
      title: "name",
      subtitle: "company",
      media: "avatar",
      featured: "featured",
    },
    prepare({ title, subtitle, media, featured }) {
      return {
        title: featured ? `⭐ ${title}` : title,
        subtitle,
        media,
      };
    },
  },
});
