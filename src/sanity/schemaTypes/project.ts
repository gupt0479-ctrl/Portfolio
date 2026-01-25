import { ProjectsIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Projects",
  type: "document",
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => [
        Rule.required().error("Project title is required"),
      ],
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => [
        Rule.required().error("Slug is required for URLs"),
      ],
    }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Short one-liner.",
      validation: (Rule) => [
        Rule.max(150).warning("Try to keep tagline under 150 characters"),
      ],
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Describe the image for accessibility",
        },
      ],
      validation: (Rule) => [
        Rule.required().error("A cover image is required for project cards"),
      ],
    }),
    defineField({
      name: "technologies",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "skill" }] })],
      description: "Select from Skills (6 is ideal).",
      validation: (Rule) => [
        Rule.max(8).warning(
          "Too many tech tags reduces readability—aim for 4–6",
        ),
      ],
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          { title: "Web Application", value: "web-app" },
          { title: "Mobile App", value: "mobile-app" },
          { title: "AI/ML Project", value: "ai-ml" },
          { title: "API/Backend", value: "api-backend" },
          { title: "DevOps/Infrastructure", value: "devops" },
          { title: "Open Source", value: "open-source" },
          { title: "CLI Tool", value: "cli-tool" },
          { title: "Desktop App", value: "desktop-app" },
          { title: "Browser Extension", value: "browser-extension" },
          { title: "Game", value: "game" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => [
        Rule.required().error("Select a category to help group projects"),
      ],
    }),
    defineField({
      name: "liveUrl",
      type: "url",
      description: "Link to the live project",
    }),
    defineField({
      name: "githubUrl",
      type: "url",
      description: "Link to the GitHub repository",
    }),
    defineField({
      name: "visibility",
      type: "string",
      options: {
        list: [
          { title: "Featured", value: "featured" },
          { title: "Standard", value: "standard" },
        ],
        layout: "radio",
      },
      initialValue: "standard",
      validation: (Rule) => [
        Rule.required().error("Select featured/standard visibility"),
      ],
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first (0–99).",
      initialValue: 0,
      validation: (Rule) => [
        Rule.min(0).error("Order cannot be negative"),
        Rule.max(99).warning("Keep order under 100 for sanity"),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      category: "category",
      visibility: "visibility",
    },
    prepare({ title, media, category, visibility }) {
      return {
        title: visibility === "featured" ? `⭐ ${title}` : title,
        subtitle: category || "Uncategorized",
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
      title: "Featured First",
      name: "featuredFirst",
      by: [
        { field: "visibility", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
});
