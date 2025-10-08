import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // eslint-disable-next-line no-unused-vars
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/test-graphql',
    // Add other protected routes here
    // Exclude /login and /api/auth/*
  ],
};
