import { Github, Linkedin, Twitter } from "lucide-react";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const FOOTER_QUERY = defineQuery(`
  *[_id == "singleton-profile"][0]{ email, socialLinks }
`);

export async function Footer() {
  const { data: profile } = await sanityFetch({ query: FOOTER_QUERY });

  const currentYear = new Date().getFullYear();

  const github = profile?.socialLinks?.github;
  const linkedin = profile?.socialLinks?.linkedin;
  const twitter = profile?.socialLinks?.twitter;

  return (
    <footer className="w-full py-12 px-6 lg:px-8 border-t border-white/10 animate-fade-in-up">
      <div className="mx-auto max-w-6xl">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-10">
          <h3 className="text-lg font-display font-semibold text-white mb-6">
            Let&apos;s Work Together
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {profile?.email && (
              <div>
                <p className="text-sm text-white/50 mb-2 font-sans">Email</p>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-white hover:text-violet-400 transition-colors duration-200 break-all font-sans"
                >
                  {profile.email}
                </a>
              </div>
            )}

            <div>
              <p className="text-sm text-white/50 mb-2 font-sans">Connect</p>
              <div className="flex gap-3">
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <Github size={16} />
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {twitter && (
                  <a
                    href={twitter}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter / X"
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <Twitter size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-white/40 font-sans pb-2">
          <p>© {currentYear} Anant Gupta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
