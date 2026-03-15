import { defineQuery } from "next-sanity";
import { ContactForm } from "@/components/ContactForm";
import { sanityFetch } from "@/sanity/lib/live";

const CONTACT_QUERY = defineQuery(`
  *[_id == "singleton-profile"][0]{ email, phone, location, socialLinks }
`);

export async function ContactSection() {
  const { data: profile } = await sanityFetch({ query: CONTACT_QUERY });

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold">
          Get In Touch
        </h2>
        <p className="text-lg text-white/60 mt-3 font-sans">
          Have a project in mind? Let&apos;s build something great.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h3 className="text-2xl font-display font-semibold">
            Let&apos;s Talk
          </h3>
          <p className="text-white/60 font-sans leading-relaxed">
            I&apos;m always open to discussing new projects, creative ideas, or
            opportunities to be part of something amazing.
          </p>
          {profile?.email && (
            <div>
              <p className="text-sm text-white/50 font-sans mb-1">Email</p>
              <a
                href={`mailto:${profile.email}`}
                className="font-display font-semibold text-white hover:text-violet-400 transition-colors duration-200"
              >
                {profile.email}
              </a>
            </div>
          )}
          {profile?.location && (
            <div>
              <p className="text-sm text-white/50 font-sans mb-1">Location</p>
              <p className="font-display font-semibold text-white">
                {profile.location}
              </p>
            </div>
          )}
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
