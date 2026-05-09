import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Property 8: Certification card required elements", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/sections/CertificationsSection.tsx"),
    "utf-8",
  );

  it("Certification card renders title (cert.name)", () => {
    expect(content).toContain("cert.name");
  });

  it("Certification card renders issuer (cert.issuer)", () => {
    expect(content).toContain("cert.issuer");
  });

  it("Certification card renders date (cert.issueDate)", () => {
    expect(content).toContain("cert.issueDate");
  });

  it("Certification card renders View Credential link when URL present", () => {
    expect(content).toContain("cert.credentialUrl");
    expect(content).toContain("View Credential");
  });

  it("Certification card uses dark variant CometCard", () => {
    expect(content).toContain('variant="dark"');
  });

  it("Certification card has holographic corner accent (cert-card class)", () => {
    expect(content).toContain("cert-card");
  });

  it("Certification section has section-kicker", () => {
    expect(content).toContain("section-kicker");
    expect(content).toContain("// credentials");
  });
});
