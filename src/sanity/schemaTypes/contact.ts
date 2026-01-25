import { InlineIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const contact = defineType({
  name: "contact",
  title: "Contact Form Submissions",
  type: "document",
  icon: InlineIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "subject",
      type: "string",
    }),
    defineField({
      name: "message",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      return {
        title: status === "new" ? `🆕 ${title}` : title,
        subtitle,
      };
    },
  },
});
