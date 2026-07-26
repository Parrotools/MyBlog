import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic auth gate for the admin area: requests without a session
 * cookie bounce straight to the login page. The real, DB-backed session
 * check happens in the admin layout — this just avoids rendering work
 * for obviously unauthenticated requests.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.get("session")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
