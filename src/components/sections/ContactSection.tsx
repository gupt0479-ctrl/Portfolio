import { defineQuery } from "next-sanity";
import {
  ContactPanel,
  type ContactProfile,
} from "@/components/ContactPanel";
import { sanityFetch } from "@/sanity/lib/live";

const CONTACT_QUERY = defineQuery(`
  coalesce(
    *[_type == "profile" && _id == "singleton-profile"][0],
    *[_type == "profile"][0]
  ){
    email,
    location,
    socialLinks{
      github,
      linkedin,
      twitter,
      website
    }
  }
`);

export async function ContactSection() {
  const { data: profile } = await sanityFetch({ query: CONTACT_QUERY });

  return <ContactPanel profile={profile as ContactProfile | null} />;
}
