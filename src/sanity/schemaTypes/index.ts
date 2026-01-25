import type { SchemaTypeDefinition } from "sanity";
import { achievement } from "./achievement";
import { blog } from "./blog";
import certifications from "./certifications";
import { contact } from "./contact";
import { education } from "./education";
import { experience } from "./experience";
import { navigation } from "./navigation";
import { profile } from "./profile";
import { project } from "./project";
import { siteSettings } from "./siteSettings";
import { skill } from "./skill";
import { testimonial } from "./testimonial";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    profile,
    project,
    skill,
    experience,
    education,
    testimonial,
    certifications,
    achievement,
    blog,
    contact,
    siteSettings,
    navigation,
  ],
};
