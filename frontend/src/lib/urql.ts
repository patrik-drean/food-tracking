import { Client, cacheExchange, fetchExchange } from 'urql';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export const urqlClient = new Client({
  url: GRAPHQL_ENDPOINT,
  exchanges: [
    cacheExchange,
    fetchExchange,
  ],
  requestPolicy: 'cache-and-network',
});
