# Task: Food Suggestions Typeahead from History

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-009
> **Status**: Not Started
> **Priority**: Medium
> **Estimated Effort**: 1-2 days
> **Assignee**: Self-directed learning
> **Created**: 2025-10-02
> **Updated**: 2025-10-02

## Task Overview

### Description
Implement smart food suggestions that appear as a typeahead dropdown while users type in the food entry form. Show previously logged foods that match the user's input, allowing quick selection to avoid re-entering common foods and to reuse cached nutrition data. This reduces the need for repeated AI analysis and speeds up logging.

### Context
This feature completes the Phase 3 smart features by helping users quickly log frequently eaten foods. Instead of typing "grilled chicken breast" every time and waiting for AI analysis, users can select it from suggestions with one tap. Focus on learning search/filtering patterns, dropdown UI components, and optimizing data fetching for suggestions.

### Dependencies
- **Prerequisite Tasks**: TASK-002 (GraphQL schema), TASK-005 (Food entry form), TASK-006 (Daily log display)
- **Blocking Tasks**: None (enhancement feature)
- **External Dependencies**: Generated GraphQL query for recent foods

## Technical Specifications

### Scope of Changes

#### Backend Changes
```
backend/src/
├── schema/
│   └── queries/
│       └── recentFoods.ts              # New: Query for recent unique foods
└── services/
    └── food/
        └── FoodSuggestionService.ts    # New: Service for food suggestions
```

#### Frontend Changes
```
frontend/src/components/food/
├── FoodEntryForm.tsx                   # Update: Add typeahead dropdown
├── FoodSuggestionDropdown.tsx          # New: Dropdown with suggestions
├── FoodSuggestionItem.tsx              # New: Individual suggestion item
└── hooks/
    └── useFoodSuggestions.ts           # New: Hook for filtering suggestions
```

### Implementation Details

#### Backend GraphQL Query
```typescript
// backend/src/schema/queries/recentFoods.ts
import { builder } from '@/schema/builder';
import { prisma } from '@/lib/prisma';

builder.queryField('recentFoods', (t) =>
  t.field({
    type: [FoodType],
    args: {
      limit: t.arg.int({ required: false, defaultValue: 20 }),
      search: t.arg.string({ required: false }),
    },
    resolve: async (_parent, args) => {
      const { limit, search } = args;

      // Get unique food descriptions with their most recent nutrition data
      const foods = await prisma.food.findMany({
        where: search
          ? {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        distinct: ['description'],
        include: {
          nutrition: true,
        },
      });

      return foods;
    },
  })
);
```

#### GraphQL Schema Extension
```graphql
type Query {
  # ... existing queries
  recentFoods(limit: Int = 20, search: String): [Food!]!
}
```

#### Food Suggestion Hook
```typescript
// frontend/src/components/food/hooks/useFoodSuggestions.ts
import { useState, useEffect, useMemo } from 'react';
import { useRecentFoodsQuery, type Food } from '@/generated/graphql';
import { debounce } from '@/lib/utils';

interface UseFoodSuggestionsOptions {
  minLength?: number;
  debounceMs?: number;
  maxResults?: number;
}

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

    const handler = debounce(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    handler();

    return () => {
      handler.cancel?.();
    };
  }, [searchTerm, shouldSearch, debounceMs]);

  // Query recent foods
  const [{ data, fetching, error }] = useRecentFoodsQuery({
    variables: {
      limit: maxResults * 2, // Fetch more for better filtering
      search: debouncedSearch || undefined,
    },
    pause: !shouldSearch || !debouncedSearch,
  });

  // Filter and score results
  const suggestions = useMemo(() => {
    if (!data?.recentFoods || !searchTerm) {
      return [];
    }

    const search = searchTerm.toLowerCase();

    return data.recentFoods
      .map((food) => {
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
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((item) => item.food);
  }, [data?.recentFoods, searchTerm, maxResults]);

  return {
    suggestions,
    isLoading: fetching,
    error,
    hasResults: suggestions.length > 0,
  };
}
```

#### Food Suggestion Dropdown Component
```typescript
// frontend/src/components/food/FoodSuggestionDropdown.tsx
'use client';

import { useEffect, useRef } from 'react';
import { FoodSuggestionItem } from './FoodSuggestionItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { type Food } from '@/generated/graphql';

interface FoodSuggestionDropdownProps {
  suggestions: Food[];
  isLoading: boolean;
  onSelect: (food: Food) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function FoodSuggestionDropdown({
  suggestions,
  isLoading,
  onSelect,
  onClose,
  isOpen,
}: FoodSuggestionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Loading suggestions...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="py-1">
          {suggestions.map((food) => (
            <FoodSuggestionItem
              key={food.id}
              food={food}
              onClick={() => {
                onSelect(food);
                onClose();
              }}
            />
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">
          No matching foods found in your history
        </div>
      )}
    </div>
  );
}
```

#### Food Suggestion Item Component
```typescript
// frontend/src/components/food/FoodSuggestionItem.tsx
import { type Food } from '@/generated/graphql';
import { Badge } from '@/components/ui/Badge';

interface FoodSuggestionItemProps {
  food: Food;
  onClick: () => void;
}

export function FoodSuggestionItem({ food, onClick }: FoodSuggestionItemProps) {
  const hasNutrition = food.calories || food.protein || food.carbs || food.fat;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {food.description}
            </p>
            {hasNutrition ? (
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                {food.calories && (
                  <span>{Math.round(food.calories)} cal</span>
                )}
                {food.protein && (
                  <span className="text-food-protein">{food.protein}g P</span>
                )}
                {food.carbs && (
                  <span className="text-food-carbs">{food.carbs}g C</span>
                )}
                {food.fat && (
                  <span className="text-food-fat">{food.fat}g F</span>
                )}
              </div>
            ) : (
              <p className="mt-1 text-xs text-gray-500">No nutrition data</p>
            )}
          </div>
          {food.isManual && (
            <Badge variant="secondary" size="sm" className="ml-2 flex-shrink-0">
              Manual
            </Badge>
          )}
        </div>
      </button>
    </li>
  );
}
```

#### Updated Food Entry Form with Typeahead
```typescript
// frontend/src/components/food/FoodEntryForm.tsx (add typeahead)
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// ... other imports
import { FoodSuggestionDropdown } from './FoodSuggestionDropdown';
import { useFoodSuggestions } from './hooks/useFoodSuggestions';
import { type Food } from '@/generated/graphql';

export function FoodEntryForm({ onSuccess }: FoodEntryFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ... existing state

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FoodEntryFormData>({
    // ... existing form config
  });

  const description = watch('description');

  // Get food suggestions based on input
  const { suggestions, isLoading: suggestionsLoading } = useFoodSuggestions(
    description || '',
    {
      minLength: 2,
      debounceMs: 300,
      maxResults: 10,
    }
  );

  /**
   * Handle selecting a food from suggestions
   */
  const handleSelectSuggestion = (food: Food) => {
    // Set description
    setValue('description', food.description);

    // Pre-fill nutrition if available
    if (food.calories || food.protein || food.carbs || food.fat) {
      setValue('nutrition.calories', food.calories || undefined);
      setValue('nutrition.fat', food.fat || undefined);
      setValue('nutrition.carbs', food.carbs || undefined);
      setValue('nutrition.protein', food.protein || undefined);

      setShowNutritionInputs(true);
      setHasAnalyzed(true);
      setAiSource('CACHED'); // Indicate it's from history
    }

    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Food Entry</h3>
        </div>

        {/* Food description input with typeahead */}
        <div className="relative">
          <Input
            {...register('description')}
            ref={inputRef}
            label="Food Description"
            placeholder="e.g., 2 slices whole wheat toast, 1 large apple"
            error={errors.description?.message}
            helpText="Start typing to see suggestions from your history"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow click on dropdown
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onChange={(e) => {
              register('description').onChange(e);
              setShowSuggestions(true);
            }}
          />

          {/* Suggestion dropdown */}
          <FoodSuggestionDropdown
            suggestions={suggestions}
            isLoading={suggestionsLoading}
            onSelect={handleSelectSuggestion}
            onClose={() => setShowSuggestions(false)}
            isOpen={showSuggestions && (suggestions.length > 0 || suggestionsLoading)}
          />
        </div>

        {/* Rest of the form... */}
        {/* ... existing AI analysis button, nutrition inputs, etc. */}
      </form>
    </Card>
  );
}
```

#### Debounce Utility
```typescript
// frontend/src/lib/utils.ts (add debounce function)
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel?: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  } as T;

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
```

## Acceptance Criteria

### Functional Requirements
- [ ] **Typeahead Display**: Dropdown shows as user types (after 2+ characters)
- [ ] **Search Filtering**: Suggestions filtered by description match
- [ ] **Click Selection**: Clicking suggestion fills description and nutrition
- [ ] **Keyboard Navigation**: Can navigate suggestions with arrow keys (future)
- [ ] **Debounced Search**: Search queries debounced to reduce API calls
- [ ] **Loading State**: Shows loading indicator while fetching suggestions
- [ ] **Empty State**: Shows "No matching foods" when no suggestions

### Technical Requirements
- [ ] **GraphQL Query**: recentFoods query works correctly
- [ ] **Type Safety**: All suggestion types properly defined
- [ ] **Performance**: Debounced search with minimal re-renders
- [ ] **Cache Utilization**: Urql caches recent foods for fast subsequent searches
- [ ] **Accessibility**: Dropdown is keyboard accessible

### User Experience Requirements
- [ ] **Responsive**: Dropdown works on mobile and desktop
- [ ] **Quick Selection**: One-click selection of suggested foods
- [ ] **Visual Hierarchy**: Clear distinction of suggestion items
- [ ] **Smart Matching**: Exact and partial matches shown in order
- [ ] **Nutrition Preview**: Shows nutrition data in suggestions

## Testing Strategy

### Unit Tests
```typescript
// frontend/tests/hooks/useFoodSuggestions.test.ts
describe('useFoodSuggestions', () => {
  it('should return empty suggestions for short search terms', () => {
    const { result } = renderHook(() => useFoodSuggestions('a'));

    expect(result.current.suggestions).toHaveLength(0);
    expect(result.current.hasResults).toBe(false);
  });

  it('should debounce search queries', async () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ search }) => useFoodSuggestions(search),
      { initialProps: { search: 'ap' } }
    );

    rerender({ search: 'app' });
    rerender({ search: 'appl' });
    rerender({ search: 'apple' });

    expect(result.current.isLoading).toBe(false); // Not loaded yet

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    jest.useRealTimers();
  });

  it('should filter and sort suggestions by relevance', async () => {
    const mockFoods = [
      { id: '1', description: 'apple pie', calories: 200 },
      { id: '2', description: 'green apple', calories: 95 },
      { id: '3', description: 'pineapple', calories: 50 },
    ];

    // Mock GraphQL query
    const { result } = renderHook(() => useFoodSuggestions('apple'));

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(3);
      expect(result.current.suggestions[0].description).toBe('green apple'); // Starts with
      expect(result.current.suggestions[2].description).toBe('pineapple'); // Contains
    });
  });
});
```

### Component Tests
```typescript
// frontend/tests/components/FoodSuggestionDropdown.test.tsx
describe('FoodSuggestionDropdown', () => {
  const mockSuggestions = [
    {
      id: '1',
      description: 'banana',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      isManual: false,
    },
  ];

  it('should render suggestions', () => {
    render(
      <FoodSuggestionDropdown
        suggestions={mockSuggestions}
        isLoading={false}
        onSelect={jest.fn()}
        onClose={jest.fn()}
        isOpen={true}
      />
    );

    expect(screen.getByText('banana')).toBeInTheDocument();
    expect(screen.getByText(/105 cal/i)).toBeInTheDocument();
  });

  it('should call onSelect when clicking a suggestion', () => {
    const onSelect = jest.fn();

    render(
      <FoodSuggestionDropdown
        suggestions={mockSuggestions}
        isLoading={false}
        onSelect={onSelect}
        onClose={jest.fn()}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByText('banana'));

    expect(onSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('should show loading state', () => {
    render(
      <FoodSuggestionDropdown
        suggestions={[]}
        isLoading={true}
        onSelect={jest.fn()}
        onClose={jest.fn()}
        isOpen={true}
      />
    );

    expect(screen.getByText(/Loading suggestions/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(
      <FoodSuggestionDropdown
        suggestions={[]}
        isLoading={false}
        onSelect={jest.fn()}
        onClose={jest.fn()}
        isOpen={true}
      />
    );

    expect(screen.getByText(/No matching foods/i)).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// frontend/tests/integration/foodSuggestionsFlow.test.tsx
describe('Food Suggestions Flow', () => {
  it('should show suggestions as user types', async () => {
    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);

    fireEvent.change(input, { target: { value: 'ban' } });

    await waitFor(() => {
      expect(screen.getByText('banana')).toBeInTheDocument();
    });
  });

  it('should fill form when selecting suggestion', async () => {
    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);

    fireEvent.change(input, { target: { value: 'ban' } });

    await waitFor(() => {
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('banana'));

    expect(input).toHaveValue('banana');
    expect(screen.getByDisplayValue('105')).toBeInTheDocument(); // Calories filled
  });

  it('should close suggestions when clicking outside', async () => {
    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);

    fireEvent.change(input, { target: { value: 'ban' } });

    await waitFor(() => {
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });
});
```

### Manual Testing Scenarios
1. **Basic Typeahead**: Type food name, see suggestions, click to select
2. **Debouncing**: Type quickly, verify only one search request
3. **Partial Match**: Type partial word, verify matching results
4. **Empty Results**: Type nonsense, see "No matching foods"
5. **Mobile UX**: Test dropdown on mobile device
6. **Keyboard Navigation**: Use arrow keys to navigate (if implemented)

## Implementation Notes

### Development Approach
1. **Step 1**: Create backend recentFoods query
2. **Step 2**: Build useFoodSuggestions hook with debouncing
3. **Step 3**: Create FoodSuggestionDropdown and item components
4. **Step 4**: Integrate typeahead into FoodEntryForm
5. **Step 5**: Add keyboard navigation (arrow keys, Enter)
6. **Step 6**: Test full flow with real data

### Learning Focus Areas
- **Search Patterns**: Debounced search with filtering
- **Dropdown UI**: Building accessible dropdown components
- **Custom Hooks**: Creating reusable hooks for complex logic
- **Performance**: Optimizing search queries and re-renders
- **Accessibility**: Keyboard navigation and ARIA attributes

### Potential Challenges
- **Click vs Blur**: Managing dropdown close timing
- **Debounce Logic**: Proper debouncing implementation
- **Mobile UX**: Dropdown behavior on mobile keyboards
- **Performance**: Efficient filtering with large food history
- **Keyboard Navigation**: Complex accessibility requirements

### Future Enhancements
- Keyboard navigation with arrow keys
- Highlight matching text in suggestions
- Group suggestions by frequency or recency
- Show thumbnail images for foods (future feature)
- Voice input for food descriptions

## Definition of Done

### Code Complete
- [ ] Backend recentFoods query implemented
- [ ] Frontend typeahead dropdown working
- [ ] Debounced search implemented
- [ ] Suggestion selection fills form correctly
- [ ] All TypeScript types defined

### User Experience Complete
- [ ] Dropdown appears smoothly
- [ ] Suggestions are relevant and ordered
- [ ] Quick selection with one click
- [ ] Works well on mobile
- [ ] Loading and empty states clear

### Testing Complete
- [ ] Unit tests for hook and components
- [ ] Integration tests for full flow
- [ ] Manual testing with real data
- [ ] Mobile testing completed
- [ ] Performance testing (large datasets)

## Related Tasks

### Prerequisite Tasks
- [TASK-002]: GraphQL schema foundation
- [TASK-005]: Food entry form
- [TASK-006]: Daily food log display

### Follow-up Tasks
- [TASK-010]: Keyboard navigation for suggestions
- [TASK-011]: Fuzzy search for better matching
- [TASK-012]: Food frequency tracking for smarter suggestions

## Notes & Comments

### Learning Objectives for This Task
1. **Search Patterns**: Implementing debounced search
2. **Dropdown Components**: Building complex dropdown UI
3. **Custom Hooks**: Creating reusable logic with hooks
4. **Performance Optimization**: Efficient filtering and rendering
5. **GraphQL Queries**: Using query hooks with search parameters

### Key Technologies Learned
- **Debouncing**: Rate-limiting user input for performance
- **Dropdown UI**: Building accessible dropdown menus
- **Search Filtering**: Client-side filtering with relevance scoring
- **React Hooks**: Custom hooks for complex state management

---

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-02 | Created | Food suggestions typeahead for learning search patterns and dropdown UI | Claude |
