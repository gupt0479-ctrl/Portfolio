import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { HeroContent } from "./HeroContent";
import { PROFILE_QUERY } from "@/sanity/lib/queries";

export default async function HeroSection() {
  const { data: profile } = await sanityFetch({ query: PROFILE_QUERY });
  if (!profile) return null;
  const profileImageUrl = profile.profileImage
    ? urlFor(profile.profileImage).width(600).height(600).url()
    : null;

  return <HeroContent profile={profile} profileImageUrl={profileImageUrl} />;
}
