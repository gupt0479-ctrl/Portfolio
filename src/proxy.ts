import { clerkMiddleware } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/studio(.*)", "/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

function createRouteMatcher(routes: string[]) {
  return (req: { nextUrl: { pathname: string } }) => {
    return routes.some((route) => {
      const pattern = route.replace(/\(.*\)/g, ".*");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(req.nextUrl.pathname);
    });
  };
}
