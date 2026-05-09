import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

type ServerClient = ReturnType<typeof createClient>;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}

let cachedServerClient: ServerClient | null = null;

export function getServerClient(): ServerClient {
  if (cachedServerClient) return cachedServerClient;

  const token = assertValue(
    process.env.SANITY_SERVER_API_TOKEN,
    "Missing environment variable: SANITY_SERVER_API_TOKEN",
  );

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

  return cachedServerClient;
}
