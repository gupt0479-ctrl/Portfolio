import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}

const token = assertValue(
  process.env.SANITY_SERVER_API_TOKEN,
  "Missing environment variable: SANITY_SERVER_API_TOKEN",
);

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
