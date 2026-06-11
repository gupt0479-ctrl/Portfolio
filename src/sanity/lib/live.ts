// Querying with "sanityFetch" will keep content automatically updated.
// Render "<SanityLive />" in the portfolio layout for live updates.
// https://github.com/sanity-io/next-sanity#live-content-api
import type { ClientReturn } from "@sanity/client";
import { defineLive } from "next-sanity/live";
import { client } from "./client";

const hasLiveTokens =
  Boolean(process.env.SANITY_SERVER_API_TOKEN) &&
  Boolean(process.env.SANITY_API_TOKEN);

const live = hasLiveTokens
  ? defineLive({
      client,
      serverToken: process.env.SANITY_SERVER_API_TOKEN,
      browserToken: process.env.SANITY_API_TOKEN,
      fetchOptions: { revalidate: 0 },
    })
  : null;

function createFetchFallback() {
  return async function sanityFetch<const QueryString extends string>({
    query,
    params,
  }: {
    query: QueryString;
    params?: Record<string, unknown>;
  }): Promise<{
    data: ClientReturn<QueryString>;
    sourceMap: null;
    tags: string[];
  }> {
    const data = await client.fetch(query, params ?? {});
    return {
      data: data as ClientReturn<QueryString>,
      sourceMap: null,
      tags: ["sanity-fetch"],
    };
  };
}

export const sanityFetch = hasLiveTokens
  ? live!.sanityFetch
  : createFetchFallback();

export const SanityLive = hasLiveTokens
  ? live!.SanityLive
  : function SanityLiveFallback() {
      return null;
    };
