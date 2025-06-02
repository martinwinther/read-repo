import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access a protected route, redirect to login
  if (!session && !isPublicRoute(req.nextUrl.pathname)) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If has session and trying to access root route, redirect to books
  if (session && req.nextUrl.pathname === '/') {
    const booksUrl = new URL('/books', req.url);
    return NextResponse.redirect(booksUrl);
  }

  return res;
}

// Helper function to determine public routes
function isPublicRoute(pathname: string) {
  // List of routes that don't require authentication
  const publicRoutes = ['/login', '/', '/auth/reset-password'];
  return publicRoutes.includes(pathname) || pathname.startsWith('/auth/');
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
