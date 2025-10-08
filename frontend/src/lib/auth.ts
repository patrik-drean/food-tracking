import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_SECRET) {
  throw new Error('Missing required environment variables for authentication');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account }) {
      // Create or update user in database via GraphQL mutation
      try {
        const response = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation CreateOrUpdateUser($input: CreateOrUpdateUserInput!) {
                createOrUpdateUser(input: $input) {
                  id
                  email
                }
              }
            `,
            variables: {
              input: {
                email: user.email!,
                name: user.name,
                image: user.image,
                provider: account!.provider,
                providerId: account!.providerAccountId,
              },
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          // eslint-disable-next-line no-console
          console.error('Failed to create/update user:', result.errors);
          return false;
        }

        // Store the database user ID on the user object
        if (result.data?.createOrUpdateUser?.id) {
          user.id = result.data.createOrUpdateUser.id;
        }

        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Sign-in error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Add user ID to token on sign-in
      if (account && user) {
        token.sub = user.id;
        token.email = user.email!;
        if (user.name !== undefined) {
          token.name = user.name;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Add user ID and access token to session
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        if (token.name !== undefined) {
          session.user.name = token.name as string | null;
        }
        // Include the JWT token in the session for API calls
        (session as any).accessToken = token;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
};
