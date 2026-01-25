import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const education = defineType({
  name: "education",
  title: "Education",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "institution",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "degree",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fieldOfStudy",
      type: "string",
    }),
    defineField({
      name: "startDate",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      type: "date",
    }),
    defineField({
      name: "current",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "gpa",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "achievements",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "website",
      type: "url",
    }),
    defineField({
      name: "order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "degree",
      subtitle: "institution",
      media: "logo",
    },
  },
});
