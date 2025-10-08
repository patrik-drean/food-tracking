export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/',
    '/test-graphql',
    // Add other protected routes here
    // Exclude /login and /api/auth/*
  ],
};
