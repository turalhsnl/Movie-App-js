import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "./lib/sessionCookie";

const PUBLIC_PATHS = [/^\/login$/];

const isPublicPath = pathname => PUBLIC_PATHS.some(pattern => pattern.test(pathname));

const isAsset = pathname =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/api") ||
  pathname.startsWith("/static") ||
  pathname === "/favicon.ico" ||
  /\.[^/]+$/.test(pathname);

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (isAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE);
  const hasSession = cookie?.value === "1";

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";

  const redirectTarget = `${pathname}${search}`;
  if (redirectTarget && redirectTarget !== "/login") {
    loginUrl.searchParams.set("redirect", redirectTarget);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/:path*",
};
