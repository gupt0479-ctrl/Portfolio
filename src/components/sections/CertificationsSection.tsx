import Image from "next/image";
import { defineQuery } from "next-sanity";
import { CometCard } from "@/components/ui/comet-card";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import type { Certification } from "@/sanity/types";

const CERTS_SECTION_QUERY = defineQuery(`
  *[_type == "certification"] | order(issueDate desc){
    _id, name, issuer, issueDate, credentialId, credentialUrl, logo
  }
`);

export async function CertificationsSection() {
  const { data: certs } = await sanityFetch({ query: CERTS_SECTION_QUERY });
  if (!certs?.length) return null;

  const list = certs as Certification[];

  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold">Certifications</h2>
        <p className="text-lg text-muted-foreground mt-3">
          Professional credentials and achievements.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((cert) => (
          <CometCard key={cert._id}>
            <div className="p-6">
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
              <h3 className="text-lg font-semibold">{cert.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {cert.issuer}
              </p>
              {cert.issueDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(cert.issueDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-primary hover:underline"
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
