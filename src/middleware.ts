import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;

  const isProtectedRoute = [
    "/lootbox",
    "/lootbox/store",
    "/trade",
    "/trade/inbox",
    "/trade/new",
    "/checkout",
  ].some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/lootbox/:path*",
    "/lootbox/store",
    "/trade",
    "/trade/inbox",
    "/trade/new",
    "/checkout",
  ],
};
