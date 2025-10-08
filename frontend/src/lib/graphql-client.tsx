'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { UrqlProvider, createClient, cacheExchange, fetchExchange, ssrExchange } from '@urql/next';
import { useSession } from 'next-auth/react';

interface GraphQLProviderProps {
  children: ReactNode;
}

const isServerSide = typeof window === 'undefined';
const ssrCache = ssrExchange({ isClient: !isServerSide });

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  const { data: session } = useSession();
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Fetch the JWT token from our API endpoint
  useEffect(() => {
    if (session) {
      fetch('/api/auth/token')
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            setJwtToken(data.token);
          }
        })
        .catch(err => console.error('Failed to get JWT token:', err));
    } else {
      setJwtToken(null);
    }
  }, [session]);

  const client = useMemo(() => {
    return createClient({
      url: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
      exchanges: [cacheExchange, ssrCache, fetchExchange],
      fetchOptions: () => {
        return {
          headers: {
            authorization: jwtToken ? `Bearer ${jwtToken}` : '',
          },
        };
      },
    });
  }, [jwtToken]);

  return (
    <UrqlProvider client={client} ssr={ssrCache}>
      {children}
    </UrqlProvider>
  );
}
