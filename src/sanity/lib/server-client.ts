import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

type ServerClient = ReturnType<typeof createClient>;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}

let cachedServerClient: ServerClient | null = null;
let cachedToken: string | null = null;

export function getServerClient(): ServerClient {
  const token = assertValue(
    process.env.SANITY_API_TOKEN,
    "Missing environment variable: SANITY_API_TOKEN",
  );

  // Invalidate cache if the token changed (e.g. rotated in .env.local)
  if (cachedServerClient && cachedToken === token) return cachedServerClient;

  cachedServerClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
    perspective: "published",
    stega: {
      enabled: process.env.NODE_ENV === "development",
      studioUrl: "/studio",
    },
  });
  cachedToken = token;

  return cachedServerClient;
}
