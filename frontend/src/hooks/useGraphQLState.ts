import { UseQueryState } from 'urql';

export interface GraphQLState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

export function useGraphQLState<T>(
  result: UseQueryState<T>
): GraphQLState<T> {
  return {
    data: result.data,
    loading: result.fetching,
    error: result.error?.message || null,
  };
}
