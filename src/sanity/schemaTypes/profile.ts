import { UserIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const profile = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "firstName",
      type: "string",
      validation: (Rule) => [
        Rule.required().error(
          "First name is required to build your identity block",
        ),
      ],
    }),
    defineField({
      name: "lastName",
      type: "string",
      validation: (Rule) => [
        Rule.required().error(
          "Last name is required to build your identity block",
        ),
      ],
    }),
    defineField({
      name: "headline",
      title: "Professional headline",
      type: "string",
      description: "What you do + what you specialize in (short).",
      validation: (Rule) => [
        Rule.required().error("Headline is required for the hero section"),
        Rule.max(80).warning(
          "Keep it under ~80 characters for best hero layout",
        ),
      ],
    }),
    defineField({
      name: "headlineStaticText",
      type: "string",
      description: "Static prefix for the animated headline (e.g., “I build”).",
    }),
    defineField({
      name: "headlineAnimatedWords",
      type: "array",
      description: "Rotating words for your headline.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => [
        Rule.min(2).error("Add at least 2 words so the animation makes sense"),
        Rule.max(10).warning("Too many words can feel noisy—aim for 3–7"),
      ],
    }),
    defineField({
      name: "headlineAnimationDuration",
      type: "number",
      description: "Time each word stays visible (ms).",
      initialValue: 3000,
      validation: (Rule) => [
        Rule.min(1000).error("Duration must be at least 1000ms"),
        Rule.max(10000).warning("Over 10s can feel sluggish"),
      ],
    }),
    defineField({
      name: "shortBio",
      type: "text",
      rows: 3,
      description: "2–3 sentence intro shown above the fold.",
      validation: (Rule) => [
        Rule.required().error("Short bio is required for the hero section"),
        Rule.max(300).warning("Keep it under 300 characters"),
      ],
    }),
    defineField({
      name: "fullBio",
      type: "array",
      description: "Long-form about section.",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "profileImage",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility",
        },
      ],
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => [
        Rule.required()
          .error("Email is required for the contact section")
          .email(),
      ],
    }),
    defineField({ name: "phone", type: "string" }),
    defineField({
      name: "location",
      type: "string",
      description: "City, State or “Remote”",
    }),
    defineField({
      name: "availability",
      title: "Availability status",
      type: "string",
      options: {
        list: [
          { title: "Available for hire", value: "available" },
          { title: "Open to opportunities", value: "open" },
          { title: "Not looking", value: "unavailable" },
        ],
        layout: "radio",
      },
      validation: (Rule) => [
        Rule.required().error("Select an availability status"),
      ],
    }),
    defineField({
      name: "socialLinks",
      type: "object",
      fields: [
        defineField({ name: "github", type: "url" }),
        defineField({ name: "linkedin", type: "url" }),
        defineField({ name: "twitter", title: "Twitter/X", type: "url" }),
        defineField({ name: "website", type: "url" }),
        defineField({ name: "medium", type: "url" }),
        defineField({ name: "devto", title: "Dev.to", type: "url" }),
        defineField({ name: "youtube", type: "url" }),
        defineField({
          name: "stackoverflow",
          title: "Stack Overflow",
          type: "url",
        }),
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
      name: "stats",
      type: "array",
      description: "Small KPI chips (e.g., “10+ projects”).",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (Rule) => [
                Rule.required().error("A stat label is required"),
              ],
            }),
            defineField({
              name: "value",
              type: "string",
              validation: (Rule) => [
                Rule.required().error("A stat value is required"),
              ],
            }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      subtitle: "headline",
      media: "profileImage",
    },
    prepare({ firstName, lastName, subtitle, media }) {
      return {
        title: [firstName, lastName].filter(Boolean).join(" "),
        subtitle,
        media,
      };
    },
  },
});
