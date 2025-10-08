import 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  // Extend the default Session type
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null | undefined;
      image?: string | null | undefined;
    };
    accessToken?: JWT;
  }
}
