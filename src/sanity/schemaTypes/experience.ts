import { CaseIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const experience = defineType({
  name: "experience",
  title: "Work Experience",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "company",
      type: "string",
      validation: (Rule) => [Rule.required().error("Company name is required")],
    }),
    defineField({
      name: "position",
      type: "string",
      validation: (Rule) => [
        Rule.required().error("Position/role is required"),
      ],
    }),
    defineField({
      name: "employmentType",
      type: "string",
      options: {
        list: [
          { title: "Full-time", value: "full-time" },
          { title: "Part-time", value: "part-time" },
          { title: "Contract", value: "contract" },
          { title: "Freelance", value: "freelance" },
          { title: "Internship", value: "internship" },
        ],
      },
    }),
    defineField({
      name: "location",
      type: "string",
      description: "City, State or “Remote”",
    }),
    defineField({
      name: "startDate",
      type: "date",
      validation: (Rule) => [Rule.required().error("Start date is required")],
    }),
    defineField({
      name: "endDate",
      type: "date",
      description: "Leave blank if current position",
    }),
    defineField({
      name: "tenure",
      title: "Tenure",
      type: "string",
      options: {
        list: [
          { title: "Current", value: "current" },
          { title: "Past", value: "past" },
        ],
        layout: "radio",
      },
      initialValue: "past",
      validation: (Rule) => [
        Rule.required().error("Select current/past tenure"),
      ],
    }),
    defineField({
      name: "description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      description: "Long-form responsibilities and impact.",
    }),
    defineField({
      name: "responsibilities",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "Bullet points of main responsibilities.",
    }),
    defineField({
      name: "achievements",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "Quantifiable outcomes (numbers preferred).",
    }),
    defineField({
      name: "technologies",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "skill" }] })],
    }),
    defineField({
      name: "companyLogo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alternative Text" }],
    }),
    defineField({ name: "companyWebsite", type: "url" }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "position",
      subtitle: "company",
      media: "companyLogo",
      tenure: "tenure",
    },
    prepare({ title, subtitle, media, tenure }) {
      return {
        title: tenure === "current" ? `${title} (Current)` : title,
        subtitle,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Newest First",
      name: "dateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
});
