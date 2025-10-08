# Frontend Development Guidelines - Food Tracking Application

This document provides Claude Code with frontend-specific guidance for the food tracking application, including architecture patterns, component standards, and development practices.

## Frontend Architecture

### Framework & Technology Stack
- **Primary Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Next.js built-in bundling with Turbopack
- **Styling**: TailwindCSS with mobile-first responsive design
- **State Management**: React Context API + useReducer for complex state, useState for simple state
- **HTTP Client**: Urql GraphQL client (@urql/next) with server-side rendering support
- **Testing**: Jest + React Testing Library for unit tests, manual testing for integration

### Project Structure
```
frontend/
├── app/                 # Next.js App Router pages and layouts
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page (daily food log)
│   ├── add-food/       # Food entry page
│   └── globals.css     # Global TailwindCSS imports
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (buttons, inputs, cards)
│   ├── forms/          # Food entry forms and nutrition editing
│   ├── food/           # Food-specific components (FoodCard, NutritionDisplay)
│   └── layout/         # Layout components (header, navigation)
├── hooks/              # Custom React hooks for GraphQL and state
├── lib/                # GraphQL client configuration and utilities
├── types/              # TypeScript type definitions for food data
├── utils/              # Utility functions (formatting, validation)
└── public/             # Static assets (icons, PWA manifest)
```

### Component Architecture Patterns

#### Component Organization
- **Feature-Based**: Components organized by food tracking features (food entry, nutrition display, daily log)
- **UI Layer Separation**: Basic UI components (buttons, inputs) separate from business logic components
- **Page-Level Components**: App Router pages that compose feature components

#### Component Structure Template
```typescript
// Food tracking component example
interface FoodCardProps {
  food: FoodEntry;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showNutrition?: boolean;
  isEditing?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onEdit,
  onDelete,
  showNutrition = true,
  isEditing = false
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{food.description}</h3>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(food.id)}
                className="text-blue-600 hover:text-blue-800"
                aria-label={`Edit ${food.description}`}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
      {showNutrition && (
        <NutritionDisplay nutrition={food.nutrition} compact />
      )}
    </div>
  );
};
```

## Coding Standards & Best Practices

### Code Style Guidelines
- **Naming Conventions**:
  - Components: PascalCase (e.g., `FoodCard`, `NutritionDisplay`)
  - Functions: camelCase (e.g., `formatCalories`, `validateFoodEntry`)
  - Files: PascalCase for components, kebab-case for utilities (e.g., `FoodCard.tsx`, `date-utils.ts`)
  - CSS Classes: TailwindCSS utility classes with responsive prefixes

- **File Organization**:
  - Component files: `ComponentName.tsx` with inline TailwindCSS classes
  - Index files: Named exports for components, default exports for pages
  - Test files: `ComponentName.test.tsx` co-located with components

### TypeScript Standards
- **Interface Definitions**: All props, GraphQL responses, and food data structures must have TypeScript interfaces
- **Type Safety**: Strict mode enabled, no `any` types, use type assertions only when necessary
- **Generic Types**: Use generics for reusable UI components (e.g., `Button<T>`, `List<T>`)
- **Utility Types**: Leverage TypeScript utility types for food data transformations (Partial for edits, Pick for display)

### Component Best Practices
- **Single Responsibility**: Each component should have one clear purpose (food display, nutrition editing, etc.)
- **Composition over Inheritance**: Compose complex UI from smaller components (FoodCard uses NutritionDisplay)
- **Props Validation**: Use TypeScript interfaces for all component props
- **Error Boundaries**: Implement error boundaries for GraphQL failures and food data issues
- **Accessibility**: Follow ARIA guidelines, semantic HTML, and keyboard navigation for food tracking flows
- **Performance**: Use React.memo for expensive nutrition calculations, lazy loading for historical data

## State Management Patterns

### Local State
- **When to Use**: Component-specific state (form inputs, UI toggles, editing modes)
- **Tools**: useState for simple state, useReducer for complex form state
- **Patterns**: Controlled components for food entry forms, local loading states

### Global State
- **When to Use**: Current date selection, user preferences, app-wide UI state
- **Tools**: React Context API with useReducer for complex state management
- **Structure**: Separate contexts for different domains (DateContext, UIContext)
- **Best Practices**: Keep contexts small and focused, avoid prop drilling

### Server State
- **When to Use**: Food entries, nutrition data, AI analysis results
- **Tools**: Urql GraphQL client with built-in caching and request deduplication
- **Patterns**: Optimistic updates for food additions, cache invalidation on mutations

## API Integration Patterns

### GraphQL Client Structure
```typescript
// Urql GraphQL operations
import { useMutation, useQuery } from 'urql';

// Query for daily food entries
const DAILY_FOOD_ENTRIES_QUERY = gql`
  query DailyFoodEntries($date: Date!) {
    foodEntries(date: $date) {
      id
      description
      nutrition {
        calories
        fat
        carbohydrates
        protein
      }
      createdAt
    }
  }
`;

// Mutation for adding food entry
const ADD_FOOD_ENTRY_MUTATION = gql`
  mutation AddFoodEntry($input: AddFoodEntryInput!) {
    addFoodEntry(input: $input) {
      id
      description
      nutrition {
        calories
        fat
        carbohydrates
        protein
      }
    }
  }
`;

// Custom hooks for food operations
export const useDailyFoodEntries = (date: string) => {
  const [result] = useQuery({
    query: DAILY_FOOD_ENTRIES_QUERY,
    variables: { date }
  });
  return result;
};

export const useAddFoodEntry = () => {
  const [, executeMutation] = useMutation(ADD_FOOD_ENTRY_MUTATION);
  return executeMutation;
};
```

### Error Handling Strategy
- **Network Errors**: Show user-friendly messages for connection issues, retry buttons for failed requests
- **Validation Errors**: Inline form validation with clear error messages for food entry fields
- **GraphQL Errors**: Handle AI nutrition analysis failures gracefully with fallback manual entry
- **User Feedback**: Toast notifications for success/error states, error boundaries for component crashes

### Loading States
- **Global Loading**: App-level loading spinner during initial data fetch
- **Component Loading**: Skeleton components for food lists, loading spinners for AI nutrition analysis
- **Progressive Loading**: Lazy load historical food data, infinite scroll for long food history

## Styling Guidelines

### CSS Architecture
- **Methodology**: TailwindCSS utility-first approach with custom components when needed
- **Responsive Design**: Mobile-first with sm:, md:, lg: breakpoints (640px, 768px, 1024px)
- **Theme System**: TailwindCSS default theme with custom colors for food categories and nutrition data
- **Component Styling**: Utility classes with conditional styling based on props

### Design System Integration
- **Component Library**: Custom components built with TailwindCSS, no external UI library
- **Custom Components**: Reusable UI components (Button, Card, Input) with consistent styling
- **Theming**: TailwindCSS configuration with custom colors for food tracking (green for good nutrition, etc.)
- **Consistency**: Consistent spacing (4px grid), typography (Inter font), and color usage across components

## Performance Optimization

### Bundle Optimization
- **Code Splitting**: Next.js automatic code splitting by page, dynamic imports for heavy components
- **Lazy Loading**: React.lazy for historical food data components, next/dynamic for charts
- **Tree Shaking**: Next.js automatic tree shaking, import only needed utilities
- **Asset Optimization**: next/image for optimized images, next/font for web font optimization

### Runtime Optimization
- **Memoization**: React.memo for expensive nutrition calculations, useMemo for filtered food lists
- **Virtual Scrolling**: Not needed for typical daily food logs (< 20 items)
- **Debouncing**: Debounce food search input to reduce API calls, debounce AI nutrition analysis
- **Caching**: Urql built-in caching for GraphQL queries, localStorage for user preferences

## Testing Strategy

### Testing Framework Setup
- **Unit Tests**: Jest + React Testing Library for component testing and utility functions
- **Integration Tests**: Testing GraphQL operations with mocked Urql client
- **E2E Tests**: Manual testing for food entry workflows (no automated E2E initially)

### Testing Patterns
```typescript
// Food tracking component test example
describe('FoodCard', () => {
  const mockFood = {
    id: '1',
    description: 'Apple, medium',
    nutrition: {
      calories: 95,
      fat: 0.3,
      carbohydrates: 25,
      protein: 0.5
    },
    createdAt: new Date().toISOString()
  };

  it('should render food description and nutrition', () => {
    render(<FoodCard food={mockFood} />);
    expect(screen.getByText('Apple, medium')).toBeInTheDocument();
    expect(screen.getByText('95 cal')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<FoodCard food={mockFood} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('should handle missing nutrition data gracefully', () => {
    const foodWithoutNutrition = { ...mockFood, nutrition: null };
    render(<FoodCard food={foodWithoutNutrition} />);
    expect(screen.getByText('Apple, medium')).toBeInTheDocument();
  });
});
```

### Testing Best Practices
- **Test Coverage**: 80%+ coverage for components and hooks, focus on user interactions
- **Test Data**: Mock food data with realistic nutrition values, mock GraphQL responses
- **User-Centric Testing**: Test user workflows (add food, edit nutrition, view daily totals)
- **Accessibility Testing**: Test keyboard navigation, screen reader compatibility with jest-axe

## Development Workflow

### Local Development
```bash
# Development server
npm run dev              # Start Next.js development server

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode

# Linting and formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Run Prettier

# Type checking
npm run type-check       # Run TypeScript compiler check

# Build
npm run build            # Build for production (Vercel uses this automatically)
npm run start            # Start production server locally
```

### Code Quality Tools
- **Linting**: ESLint with Next.js config, TypeScript rules, accessibility plugin
- **Formatting**: Prettier with TailwindCSS plugin for class sorting
- **Type Checking**: TypeScript strict mode with exactOptionalPropertyTypes
- **Pre-commit Hooks**: Husky with lint-staged for automated formatting and linting

### Browser Support
- **Target Browsers**: Modern browsers (Chrome 91+, Firefox 90+, Safari 14+, Edge 91+)
- **Polyfills**: Next.js automatic polyfills, no additional polyfills needed
- **Progressive Enhancement**: Works without JavaScript for basic food viewing, enhanced with JS
- **Testing**: Primary testing on Chrome and Safari mobile, manual testing on different devices

## Accessibility Guidelines

### ARIA Standards
- **Semantic HTML**: Use proper elements (button, form, main, section) for food tracking interface
- **ARIA Labels**: Label nutrition values and food items for screen readers
- **Keyboard Navigation**: Full keyboard navigation for food entry and editing workflows
- **Screen Reader Support**: Announce nutrition totals and food addition confirmations

### Accessibility Testing
- **Automated Testing**: jest-axe for component accessibility testing
- **Manual Testing**: Keyboard-only navigation testing, VoiceOver testing on mobile
- **Color Contrast**: WCAG AA contrast for all text, especially nutrition data displays
- **Focus Management**: Proper focus handling when navigating between food entries

## Security Considerations

### Frontend Security
- **XSS Prevention**: Sanitize food descriptions and user input before display
- **CSRF Protection**: Not applicable (no authentication system)
- **Authentication**: Not implemented (single-user application)
- **Data Validation**: Validate nutrition values are positive numbers, food descriptions are non-empty

### Sensitive Data Handling
- **Environment Variables**: Store GraphQL endpoint and any API keys in environment variables
- **Local Storage**: Safe to store user preferences and food history (personal use app)
- **URL Parameters**: Avoid sensitive data in URLs (dates are acceptable)
- **Error Messages**: Don't expose internal API details in user-facing error messages

---

## Development Commands Quick Reference

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check

# Build for production (Vercel deployment)
npm run build

# Preview production build locally
npm run start
```

## Common Patterns & Examples

### Data Fetching Pattern
```typescript
// GraphQL data fetching for food entries
import { useQuery } from 'urql';

const useFoodEntries = (date: string) => {
  const [result, reexecuteQuery] = useQuery({
    query: DAILY_FOOD_ENTRIES_QUERY,
    variables: { date },
    requestPolicy: 'cache-and-network'
  });

  return {
    data: result.data?.foodEntries ?? [],
    loading: result.fetching,
    error: result.error,
    refetch: reexecuteQuery
  };
};
```

### Form Handling Pattern
```typescript
// Food entry form with validation
interface FoodEntryFormProps {
  onSubmit: (data: FoodEntryInput) => void;
  initialData?: Partial<FoodEntryInput>;
}

const FoodEntryForm: React.FC<FoodEntryFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<FoodEntryInput>({
    description: initialData?.description ?? '',
    nutrition: initialData?.nutrition ?? null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Food description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Food Description
        </label>
        <input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Food
      </button>
    </form>
  );
};
```

### Error Handling Pattern
```typescript
// Error boundary for food tracking components
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
      <div className="text-center p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">Unable to load food data. Please try again.</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const FoodTrackingErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Food tracking error:', error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
```

---

## Food Tracking Specific Guidelines

### Food Data Handling
- **Food Descriptions**: Always trim whitespace, validate non-empty descriptions
- **Nutrition Data**: Handle null/undefined nutrition gracefully, provide fallbacks
- **Date Handling**: Use ISO date strings for API calls, format for display with date-fns
- **Portion Sizes**: Store as strings to allow for descriptions like "1 medium apple"

### User Experience Patterns
- **Mobile-First**: Design all interactions for mobile touch interfaces first
- **Quick Entry**: Minimize taps/clicks needed to log food items
- **Visual Feedback**: Provide immediate feedback for AI nutrition analysis loading
- **Graceful Degradation**: Show manual entry options when AI analysis fails

### AI Integration Guidelines
- **Loading States**: Show clear loading indicators during AI analysis
- **User Control**: Always allow users to edit AI-generated nutrition data
- **Fallback Options**: Provide manual nutrition entry when AI is unavailable
- **Cost Awareness**: Cache AI results to minimize unnecessary API calls

This document ensures Claude Code understands the food tracking application architecture and follows established patterns when implementing features or making changes.