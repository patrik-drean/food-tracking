import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'urql';

// Inline GraphQL query (using inline to avoid codegen dependency)
const RECENT_FOODS_QUERY = `
  query RecentFoods($limit: Int, $search: String) {
    recentFoods(limit: $limit, search: $search) {
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

interface UseFoodSuggestionsOptions {
  minLength?: number;
  debounceMs?: number;
  maxResults?: number;
}

/**
 * Hook for fetching and filtering food suggestions based on user input
 * Implements debounced search with relevance scoring
 */
export function useFoodSuggestions(
  searchTerm: string,
  options: UseFoodSuggestionsOptions = {}
) {
  const { minLength = 2, debounceMs = 300, maxResults = 10 } = options;

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const shouldSearch = searchTerm.length >= minLength;

  // Debounce search term
  useEffect(() => {
    if (!shouldSearch) {
      setDebouncedSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, shouldSearch, debounceMs]);

  // Query recent foods with search filter
  const [{ data, fetching, error }] = useQuery({
    query: RECENT_FOODS_QUERY,
    variables: {
      limit: maxResults * 2, // Fetch more for better filtering
      search: debouncedSearch || undefined,
    },
    pause: !shouldSearch || !debouncedSearch,
  });

  // Filter and score results by relevance
  const suggestions = useMemo(() => {
    if (!data?.recentFoods || !searchTerm) {
      return [];
    }

    const search = searchTerm.toLowerCase();

    interface ScoredFood {
      food: Food;
      score: number;
    }

    return data.recentFoods
      .map((food: Food): ScoredFood => {
        const description = food.description.toLowerCase();
        const exactMatch = description === search;
        const startsWith = description.startsWith(search);
        const contains = description.includes(search);

        // Calculate relevance score
        let score = 0;
        if (exactMatch) score = 100;
        else if (startsWith) score = 50;
        else if (contains) score = 25;

        return { food, score };
      })
      .filter((item: ScoredFood) => item.score > 0)
      .sort((a: ScoredFood, b: ScoredFood) => b.score - a.score)
      .slice(0, maxResults)
      .map((item: ScoredFood) => item.food);
  }, [data?.recentFoods, searchTerm, maxResults]);

  return {
    suggestions,
    isLoading: fetching,
    error,
    hasResults: suggestions.length > 0,
  };
}
