import { SquareIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const serviceType = defineType({
  name: "service",
  type: "document",
  title: "Service",
  icon: SquareIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
    }),
    defineField({
      name: "features",
      type: "array",
      title: "Features",
      of: [{ type: "string" }],
    }),
    defineField({ name: "price", type: "number", title: "Price" }),
    defineField({
      name: "priceType",
      type: "string",
      title: "Price Type",
      options: { list: ["hourly", "project", "monthly"] },
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Featured",
      initialValue: false,
    }),
    defineField({ name: "icon", type: "string", title: "Icon Name" }),
    defineField({ name: "order", type: "number", title: "Order" }),
  ],
  preview: { select: { title: "title", subtitle: "priceType" } },
});
