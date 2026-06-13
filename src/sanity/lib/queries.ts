// src/sanity/lib/queries.ts
import { defineQuery } from "next-sanity";

export const PROFILE_QUERY = defineQuery(`
coalesce(
  *[_type == "profile" && _id == "singleton-profile"][0],
  *[_type == "profile"][0]
){
  _id,
  firstName,
  lastName,
  headline,
  headlineStaticText,
  headlineAnimatedWords,
  headlineAnimationDuration,
  shortBio,
  fullBio,
  profileImage,
  email,
  phone,
  location,
  availability,
  socialLinks{
    github,
    linkedin,
    twitter,
    website,
    medium,
    devto,
    youtube,
    stackoverflow
  },
  yearsOfExperience,
  stats[]{
    label,
    value
  }
}
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
coalesce(
  *[_type == "siteSettings" && _id == "singleton-site-settings"][0],
  *[_type == "siteSettings" && _id == "singleton-siteSettings"][0],
  *[_type == "siteSettings"][0]
){
  _id,
  siteTitle,
  siteDescription,
  siteLogo,
  showBlog,
  _createdAt,
  _updatedAt
}
`);

export const NAVIGATION_QUERY = defineQuery(`
*[_type == "navigation"] | order(order asc){
  _id,
  title,
  href,
  icon,
  "isExternal": select(
    isExternal == true => true,
    linkType == "external" => true,
    false
  ),
  order
}
`);

export const PROJECTS_QUERY = defineQuery(`
*[_type == "project"] | order(order asc, title asc){
  _id,
  title,
  slug{ current },
  tagline,
  summary,
  coverImage,
  technologies[]->{
    _id,
    name,
    category,
    proficiency,
    percentage,
    yearsOfExperience,
    tone,
    color
  },
  category,
  liveUrl,
  githubUrl,
  "featured": coalesce(featured, false),
  order
}
`);

export const SKILLS_QUERY = defineQuery(`
*[_type == "skill"] | order(category asc, name asc){
  _id,
  name,
  category,
  proficiency,
  percentage,
  yearsOfExperience,
  "tone": coalesce(tone, "neutral"),
  color
}
`);

export const EXPERIENCE_QUERY = defineQuery(`
*[_type == "experience"] | order(order asc, startDate desc){
  _id,
  company,
  position,
  employmentType,
  location,
  startDate,
  endDate,
  "current": select(
    defined(tenure) => tenure == "current",
    current == true => true,
    false
  ),
  "tenure": select(
    defined(tenure) => tenure,
    current == true => "current",
    "past"
  ),
  description,
  responsibilities[],
  achievements[],
  technologies[]->{
    _id,
    name,
    category,
    proficiency,
    percentage,
    yearsOfExperience,
    tone,
    color
  },
  companyLogo,
  companyWebsite,
  order
}
`);

export const EDUCATION_QUERY = defineQuery(`
  *[_type == "education"] | order(startDate desc){
    _id, institution, degree, fieldOfStudy, startDate, endDate, current, description, gpa, logo
  }
`);

export const CERTIFICATIONS_QUERY = defineQuery(`
  *[_type == "certification"] | order(issueDate desc){
    _id, name, issuer, issueDate, credentialId, credentialUrl, logo, description
  }
`);

export const ACHIEVEMENTS_QUERY = defineQuery(`
  *[_type == "achievement"] | order(featured desc, order asc, date desc){
    _id, title, description, date, type, featured, url
  }
`);

export const BLOG_QUERY = defineQuery(`
  *[_type == "blog"] | order(publishedAt desc)[0...6]{
    _id, title, slug, excerpt, externalUrl, publishedAt, readTime, category, featuredImage
  }
`);

export const PROJECT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, tagline, summary,
    "technologies": technologies[]->{ name },
    liveUrl, githubUrl
  }
`);

export const EXPERIENCE_BY_ID_QUERY = defineQuery(`
  *[_type == "experience" && _id == $id][0]{
    _id, company, position, employmentType, location,
    startDate, endDate, current, description,
    responsibilities, "technologies": technologies[]->{ name }
  }
`);

export const CHAT_CATALOG_QUERY = defineQuery(`{
  "projects": *[_type == "project"] | order(order asc, title asc){
    _id, title, "slug": slug.current, tagline
  },
  "experience": *[_type == "experience"] | order(order asc, startDate desc){
    _id, company, position,
    "current": select(current == true => true, tenure == "current" => true, false),
    description
  },
  "skills": *[_type == "skill"] | order(category asc, name asc){
    _id, name, category, proficiency
  },
  "education": *[_type == "education"] | order(startDate desc){
    _id, institution, degree, fieldOfStudy, startDate, endDate
  },
  "certifications": *[_type == "certification"] | order(issueDate desc){
    _id, name, issuer, issueDate
  },
  "achievements": *[_type == "achievement"] | order(featured desc, order asc){
    _id, title, description, date, type, featured
  }
}`);
