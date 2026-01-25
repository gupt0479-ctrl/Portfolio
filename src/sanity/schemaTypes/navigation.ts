import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => [
        Rule.required().error("A label is required for the nav link"),
      ],
    }),
    defineField({
      name: "href",
      type: "string",
      description: "Anchor (e.g. #projects) or absolute URL (https://...)",
      validation: (Rule) => [
        Rule.required().error("A destination is required for the nav link"),
      ],
    }),
    defineField({
      name: "icon",
      type: "string",
      description: "Tabler icon name (e.g., IconHome, IconBrandGithub)",
      validation: (Rule) => [
        Rule.required().error("An icon name is required for consistent UI"),
      ],
    }),
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      options: {
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
      validation: (Rule) => [
        Rule.required().error(
          "Select whether the link is internal or external",
        ),
      ],
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 0,
      validation: (Rule) => [
        Rule.required().error("Order is required to sort navigation"),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "href", order: "order" },
    prepare({ title, subtitle, order }) {
      return { title: `${order}. ${title}`, subtitle };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
