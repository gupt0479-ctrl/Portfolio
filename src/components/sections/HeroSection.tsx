import { sanityFetch } from "@/sanity/lib/live";
import { PROFILE_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { HeroContent } from "./HeroContent";

export default async function HeroSection() {
  const { data: profile } = await sanityFetch({ query: PROFILE_QUERY });

  if (!profile) return null;

  const profileImageUrl = profile.profileImage
    ? urlFor(profile.profileImage).width(600).height(600).url()
    : null;

  return (
    <section className="relative min-h-svh overflow-hidden bg-transparent">
      {/* Hero Content Overlay */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-28">
        <HeroContent profile={profile} profileImageUrl={profileImageUrl} />
      </div>
    </section>
  );
}
