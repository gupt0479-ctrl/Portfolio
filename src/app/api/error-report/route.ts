import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.error(
      "[client-error]",
      JSON.stringify({
        error:
          typeof body.error === "string" ? body.error.slice(0, 500) : "unknown",
        stack:
          typeof body.stack === "string"
            ? body.stack.slice(0, 1000)
            : undefined,
        component:
          typeof body.component === "string"
            ? body.component.slice(0, 200)
            : undefined,
      }),
    );
  } catch {
    // Malformed body — silently ignore
  }
  return new NextResponse(null, { status: 204 });
}

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic";
