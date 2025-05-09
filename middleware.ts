import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  "/dashboard",
  "/chat",
  "/boards",
  "/notes",
  "/team",
  "/settings",
  "/team-selection"
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const jwtToken = request.cookies.get("token")?.value;
  
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register");
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthPage) {
    if (token || jwtToken) {
      return NextResponse.redirect(new URL("/team-selection", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute && !token && !jwtToken) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};