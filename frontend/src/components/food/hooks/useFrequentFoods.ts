import { useQuery } from 'urql';

const FREQUENT_FOODS_QUERY = `
  query FrequentFoods($limit: Int, $days: Int) {
    frequentFoods(limit: $limit, days: $days) {
      id
      description
      calories
      protein
      carbs
      fat
      isManual
      createdAt
    }
  }
`;

interface Food {
  id: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isManual: boolean;
  createdAt: string;
}

interface UseFrequentFoodsOptions {
  limit?: number;
  days?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching user's most frequently logged foods
 * Uses cache-first policy to minimize backend calls
 */
export function useFrequentFoods(options: UseFrequentFoodsOptions = {}) {
  const { limit = 10, days = 14, enabled = true } = options;

  const [{ data, fetching, error }] = useQuery({
    query: FREQUENT_FOODS_QUERY,
    variables: { limit, days },
    pause: !enabled,
    requestPolicy: 'cache-first', // Use cached data if available
  });

  return {
    frequentFoods: (data?.frequentFoods as Food[]) || [],
    isLoading: fetching,
    error,
  };
}
