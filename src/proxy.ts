import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateAdminSession } from "./lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return updateAdminSession(request);
  }
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except API routes, Next internals and static files
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
