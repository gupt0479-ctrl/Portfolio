// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import type { ClientReturn } from "@sanity/client";
import { defineLive } from "next-sanity/live";
import { getLocalDataForQuery } from "@/lib/localContent";
import { client } from "./client";

const live = defineLive({
  client,
  serverToken: process.env.SANITY_SERVER_API_TOKEN,
  browserToken: process.env.SANITY_API_TOKEN,
  fetchOptions: { revalidate: 0 },
});

const { SanityLive } = live;

const preferLocalContent =
  process.env.PORTFOLIO_CONTENT_SOURCE === "local" ||
  (process.env.NODE_ENV === "development" &&
    process.env.PORTFOLIO_CONTENT_SOURCE !== "sanity");

function hasUsableData(data: unknown) {
  if (Array.isArray(data)) return data.length > 0;
  return data !== null && data !== undefined;
}

async function loadLocalQueryResult<QueryString extends string>(
  query: QueryString,
) {
  const localData = await getLocalDataForQuery(query);
  if (localData === undefined) return null;

  return {
    data: localData as ClientReturn<QueryString>,
    sourceMap: null,
    tags: ["local-data"],
  };
}

export async function sanityFetch<const QueryString extends string>(
  options: Parameters<typeof live.sanityFetch<QueryString>>[0],
): Promise<Awaited<ReturnType<typeof live.sanityFetch<QueryString>>>> {
  if (preferLocalContent) {
    const localResult = await loadLocalQueryResult(options.query);
    if (localResult) {
      return localResult;
    }
  }

  try {
    const result = await live.sanityFetch(options);
    if (hasUsableData(result.data)) {
      return result;
    }

    const localResult = await loadLocalQueryResult(options.query);
    if (localResult) {
      return {
        ...result,
        ...localResult,
      };
    }

    return result;
  } catch (error) {
    const localResult = await loadLocalQueryResult(options.query);
    if (localResult) {
      return localResult;
    }

    throw error;
  }
}

export { SanityLive };
