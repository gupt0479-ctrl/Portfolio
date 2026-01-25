import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const skill = defineType({
  name: "skill",
  title: "Skills",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => [Rule.required().error("Skill name is required")],
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          { title: "Frontend", value: "frontend" },
          { title: "Backend", value: "backend" },
          { title: "AI/ML", value: "ai-ml" },
          { title: "DevOps", value: "devops" },
          { title: "Database", value: "database" },
          { title: "Mobile", value: "mobile" },
          { title: "Cloud", value: "cloud" },
          { title: "Testing", value: "testing" },
          { title: "Design", value: "design" },
          { title: "Tools", value: "tools" },
          { title: "Soft Skills", value: "soft-skills" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => [
        Rule.required().error("Skill category is required for grouping"),
      ],
    }),
    defineField({
      name: "proficiency",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
          { title: "Expert", value: "expert" },
        ],
        layout: "radio",
      },
      validation: (Rule) => [
        Rule.required().error("Select a proficiency level"),
      ],
    }),
    defineField({
      name: "percentage",
      type: "number",
      description: "0–100 for progress visuals.",
      validation: (Rule) => [
        Rule.min(0).error("Must be at least 0"),
        Rule.max(100).error("Must be 100 or less"),
      ],
    }),
    defineField({
      name: "yearsOfExperience",
      type: "number",
      validation: (Rule) => [
        Rule.min(0).error("Years of experience cannot be negative"),
      ],
    }),
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      description:
        "Used to style badges consistently without hardcoding colors.",
      options: {
        list: [
          { title: "Neutral", value: "neutral" },
          { title: "Accent", value: "accent" },
          { title: "Highlight", value: "highlight" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
      initialValue: "neutral",
      validation: (Rule) => [
        Rule.required().error("Choose a tone for consistent theming"),
      ],
    }),
    // remove old "color" field from your type
  ],
  preview: {
    select: { title: "name", category: "category", proficiency: "proficiency" },
    prepare({ title, category, proficiency }) {
      return { title, subtitle: `${category} · ${proficiency}` };
    },
  },
  orderings: [
    {
      title: "Category, then Name",
      name: "categoryName",
      by: [
        { field: "category", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
});
