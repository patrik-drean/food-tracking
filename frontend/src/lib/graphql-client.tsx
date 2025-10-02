'use client';

import { ReactNode } from 'react';
import { UrqlProvider } from '@urql/next';
import { ssrExchange } from 'urql';
import { urqlClient } from './urql';

interface GraphQLProviderProps {
  children: ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  const ssr = ssrExchange({ isClient: typeof window !== 'undefined' });
  
  return (
    <UrqlProvider client={urqlClient} ssr={ssr}>
      {children}
    </UrqlProvider>
  );
}
