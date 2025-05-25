import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/register');

  const { pathname } = request.nextUrl

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/teamlane-192x192.png') ||
    pathname.startsWith('/teamlane-512x512.png') ||
    pathname.startsWith('/robots.txt') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.webmanifest')
  ) {
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/team-selection', request.url));
    }
    return null;
  }

  if (!isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};