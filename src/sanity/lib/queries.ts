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
  *[_type == "siteSettings" && _id == "singleton-siteSettings"][0],
  *[_type == "siteSettings"][0]
){
  _id,
  siteTitle,
  siteDescription,
  siteKeywords,
  siteLogo,
  favicon,
  ogImage,
  primaryColor,
  secondaryColor,
  accentColor,
  ctaText,
  ctaUrl,
  heroHeadline,
  heroSubheadline,
  heroBackground,
  showBlog,
  showServices,
  showTestimonials,
  googleAnalyticsId,
  facebookPixelId,
  twitterHandle,
  footer{
    text,
    copyrightText,
    links[]{ title, url }
  },
  maintenanceMode,
  maintenanceMessage
}
`);

export const NAVIGATION_QUERY = defineQuery(`
*[_type == "navigation"] | order(order asc){
  _id,
  title,
  href,
  icon,
  isExternal,
  order
}
`);

export const PROJECTS_QUERY = defineQuery(`
*[_type == "project"] | order(featured desc, order asc){
  _id,
  title,
  slug{ current },
  tagline,
  coverImage,
  technologies[]->{
    _id,
    name,
    category,
    proficiency,
    percentage,
    yearsOfExperience,
    color
  },
  category,
  liveUrl,
  githubUrl,
  featured,
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
  current,
  responsibilities[],
  achievements[],
  technologies[]->{
    _id,
    name,
    category,
    proficiency,
    percentage,
    yearsOfExperience,
    color
  },
  companyLogo,
  companyWebsite,
  order
}
`);
