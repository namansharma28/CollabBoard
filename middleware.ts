import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/home' ||
    pathname.startsWith('/teamlane') ||
    pathname.startsWith('/animat') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg')
  ) {
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    if (isAuth) {
      return NextResponse.redirect(new URL('/team-selection', request.url));
    }
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Handle auth pages (login/register)
  if (pathname === '/login' || pathname === '/register') {
    if (isAuth) {
      return NextResponse.redirect(new URL('/team-selection', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!isAuth && !pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};