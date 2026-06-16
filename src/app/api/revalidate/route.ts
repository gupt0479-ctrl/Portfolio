import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook handler for on-demand revalidation.
 *
 * Configure in Sanity dashboard:
 *   URL:    https://anantgupta.dev/api/revalidate
 *   Secret: <SANITY_REVALIDATE_SECRET>
 *   Trigger: Create, Update, Delete
 *   Filter: leave blank (all document types)
 *   Projection: {_type, slug}
 */
export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: { current?: string };
    }>(req, process.env.SANITY_REVALIDATE_SECRET);

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (!body?._type) {
      return new Response("Bad request", { status: 400 });
    }

    // Revalidate the entire site since all content renders on the single-page portfolio
    revalidatePath("/");

    return Response.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return new Response(
      err instanceof Error ? err.message : "Internal Server Error",
      { status: 500 },
    );
  }
}
