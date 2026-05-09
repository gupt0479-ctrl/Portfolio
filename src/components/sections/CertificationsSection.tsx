import Image from "next/image";
import { defineQuery } from "next-sanity";
import { CometCard } from "@/components/ui/comet-card";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import type { Certification } from "@/sanity/types";

// Include skills reference so we can render optional skill tags
const CERTS_SECTION_QUERY = defineQuery(`
  *[_type == "certification"] | order(issueDate desc){
    _id, name, issuer, issueDate, credentialId, credentialUrl, logo,
    skills[]->{ _id, name, category }
  }
`);

type CertWithSkills = Omit<Certification, "skills"> & {
  skills?: Array<{
    _id: string;
    name?: string | null;
    category?: string | null;
  }> | null;
};

export async function CertificationsSection() {
  const { data: certs } = await sanityFetch({ query: CERTS_SECTION_QUERY });
  if (!certs?.length) return null;

  const list = certs as CertWithSkills[];

  return (
    <section
      id="certifications"
      className="section-backdrop mx-auto max-w-6xl px-6 py-24"
    >
      <div className="mb-16">
        <p className="section-kicker">{"// credentials"}</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Certifications
        </h2>
        <p className="text-lg text-white/55 mt-3 font-sans">
          Professional credentials and achievements.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((cert) => (
          <CometCard key={cert._id} variant="dark">
            <div className="cert-card relative p-6">
              {/* Issuer badge / logo */}
              {cert.logo && (
                <div className="w-full h-40 relative mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(cert.logo).width(400).height(160).url()}
                    alt={cert.name ?? "Certificate"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="text-base font-display font-semibold text-white leading-snug">
                {cert.name}
              </h3>

              {/* Issuer */}
              <p className="text-white/55 text-sm mt-1 font-sans">
                {cert.issuer}
              </p>

              {/* Date */}
              {cert.issueDate && (
                <p className="text-xs text-white/40 mt-1 font-mono">
                  {new Date(cert.issueDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              {/* Optional skill tags */}
              {cert.skills && cert.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cert.skills.slice(0, 4).map((skill) => (
                    <span key={skill._id} className="orbit-chip">
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}

              {/* View Credential link */}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="float-btn mt-4 inline-flex items-center gap-1 text-sm text-violet-300/90 hover:text-violet-200 font-sans"
                >
                  View Credential →
                </a>
              )}
            </div>
          </CometCard>
        ))}
      </div>
    </section>
  );
}
