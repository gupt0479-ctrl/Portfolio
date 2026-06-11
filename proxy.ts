import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/sanity(.*)",
  "/api/draft-mode(.*)",
  "/api/chat(.*)",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Next.js 16 proxy takes (request). Clerk expects (request, event); we provide a minimal event.
let capturedResponse: NextResponse | undefined;
const event = {
  respondWith: (r: Response | Promise<Response>) => {
    Promise.resolve(r).then((res) => {
      capturedResponse = res as NextResponse;
    });
    return Promise.resolve(r);
  },
};

export async function proxy(req: NextRequest): Promise<NextResponse> {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  capturedResponse = undefined;
  const result = await clerk(
    req,
    event as unknown as Parameters<typeof clerk>[1],
  );
  await Promise.resolve(); // allow respondWith callback to run
  return capturedResponse ?? (result as NextResponse) ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
