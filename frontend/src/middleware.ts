import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isLoginPage = req.nextUrl.pathname === '/login';

    // If authenticated user tries to access login page, redirect to home
    if (token && isLoginPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page for unauthenticated users
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // Require token for all other routes
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/login',
    '/test-graphql',
    // Add other protected routes here
  ],
};
