# Quality Guidelines

This document provides Claude Code with comprehensive quality standards for the food tracking application, including code quality, testing requirements, performance standards, and review criteria.

## Code Quality Standards

### Architecture Compliance
- **TypeScript Strict Mode**: Enable strict type checking, strict null checks, and no implicit any
- **Layer Separation**: Clear separation between GraphQL resolvers, business logic, data access, and React components
- **Dependency Management**: Use dependency injection for services, proper GraphQL schema composition
- **Code Organization**: Feature-based organization with clear separation of concerns

### Coding Standards
#### General Principles
- **Type Safety**: Leverage TypeScript's type system to prevent runtime errors
- **Immutability**: Use readonly types and immutable data patterns where appropriate
- **Error Handling**: Comprehensive error handling for nutrition data processing and AI interactions
- **Performance**: Optimize for mobile devices and nutrition calculation efficiency

#### TypeScript Standards for Food Tracking
```typescript
// Nutrition data interfaces with proper typing
interface NutritionFacts {
  readonly calories: number;
  readonly protein: number; // grams
  readonly carbohydrates: number; // grams
  readonly fat: number; // grams
  readonly fiber?: number; // grams, optional
  readonly sugar?: number; // grams, optional
  readonly sodium?: number; // mg, optional
}

interface FoodItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly nutrition: NutritionFacts;
  readonly servingSize: {
    readonly amount: number;
    readonly unit: 'g' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'piece';
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// GraphQL resolver type safety
type FoodResolver = Resolver<FoodItem, {}, ResolverContext>;

// React component props with strict typing
interface FoodLogEntryProps {
  readonly entry: FoodLogEntry;
  readonly onEdit: (entryId: string) => void;
  readonly onDelete: (entryId: string) => Promise<void>;
  readonly isEditing?: boolean;
}

// Utility function with explicit return types and error handling
function calculateDailyNutrition(entries: FoodLogEntry[]): Result<DailyNutrition, NutritionCalculationError> {
  try {
    const totalNutrition = entries.reduce((acc, entry) => {
      const multiplier = entry.servings;
      return {
        calories: acc.calories + (entry.food.nutrition.calories * multiplier),
        protein: acc.protein + (entry.food.nutrition.protein * multiplier),
        carbohydrates: acc.carbohydrates + (entry.food.nutrition.carbohydrates * multiplier),
        fat: acc.fat + (entry.food.nutrition.fat * multiplier),
      };
    }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });

    return { success: true, data: totalNutrition };
  } catch (error) {
    return { success: false, error: new NutritionCalculationError('Failed to calculate daily nutrition', error) };
  }
}
```

### Documentation Standards
#### Code Documentation Requirements
- **JSDoc for Complex Functions**: Document nutrition calculations, AI integration functions, and data transformations
- **GraphQL Schema Documentation**: Comprehensive descriptions for all types, queries, and mutations
- **Component Documentation**: React component props, usage examples, and accessibility considerations
- **API Integration Documentation**: OpenAI API usage patterns and error handling strategies

#### Documentation Examples
```typescript
/**
 * Analyzes food description using OpenAI GPT-4o-mini to extract nutrition information
 * @param description - Natural language description of food (e.g., "2 slices of whole wheat bread")
 * @param userId - User ID for usage tracking and personalization
 * @returns Promise resolving to structured nutrition data or error
 * @throws {AIAnalysisError} When OpenAI API fails or returns invalid data
 * @throws {ValidationError} When food description is invalid or too vague
 *
 * @example
 * ```typescript
 * const result = await analyzeFood("1 medium apple", "user123");
 * if (result.success) {
 *   console.log(`Calories: ${result.data.nutrition.calories}`);
 * }
 * ```
 */
async function analyzeFood(
  description: string,
  userId: string
): Promise<Result<FoodAnalysisResult, AIAnalysisError | ValidationError>> {
  // Implementation with comprehensive error handling
}

/**
 * Food log entry component for displaying and editing logged food items
 * @component
 * @param props.entry - The food log entry to display
 * @param props.onEdit - Callback when user wants to edit the entry
 * @param props.onDelete - Async callback when user wants to delete the entry
 * @param props.isEditing - Whether the entry is currently being edited
 *
 * @accessibility
 * - Supports keyboard navigation
 * - Screen reader friendly with proper ARIA labels
 * - High contrast mode compatible
 *
 * @example
 * ```tsx
 * <FoodLogEntry
 *   entry={entry}
 *   onEdit={(id) => setEditingId(id)}
 *   onDelete={handleDelete}
 *   isEditing={editingId === entry.id}
 * />
 * ```
 */
export const FoodLogEntry: React.FC<FoodLogEntryProps> = ({ entry, onEdit, onDelete, isEditing }) => {
  // Component implementation
};
```

## Testing Standards

### Test Coverage Requirements
- **Unit Tests**: 90%+ coverage for nutrition calculations, 85%+ for GraphQL resolvers, 80%+ for React components
- **Integration Tests**: All GraphQL operations, Prisma database interactions, OpenAI API integration
- **End-to-End Tests**: Critical food tracking workflows (add food, view nutrition, daily goals)
- **Performance Tests**: Nutrition calculation performance, GraphQL query optimization, mobile responsiveness

### Test Organization for Food Tracking
```
tests/
├── unit/
│   ├── nutrition/          # Nutrition calculation tests
│   │   ├── calculator.test.ts
│   │   ├── validator.test.ts
│   │   └── converter.test.ts
│   ├── graphql/           # GraphQL resolver tests
│   │   ├── food.resolver.test.ts
│   │   ├── user.resolver.test.ts
│   │   └── nutrition.resolver.test.ts
│   ├── components/        # React component unit tests
│   │   ├── FoodLogEntry.test.tsx
│   │   ├── NutritionSummary.test.tsx
│   │   └── FoodSearch.test.tsx
│   ├── ai/               # AI integration tests
│   │   ├── foodAnalyzer.test.ts
│   │   └── nutritionExtractor.test.ts
│   └── utils/            # Utility function tests
├── integration/
│   ├── api/              # GraphQL API integration tests
│   │   ├── food-operations.test.ts
│   │   └── user-operations.test.ts
│   ├── database/         # Prisma integration tests
│   │   ├── food-repository.test.ts
│   │   └── user-repository.test.ts
│   └── external/         # External service integration
│       └── openai.test.ts
├── e2e/
│   ├── food-tracking/    # End-to-end food tracking flows
│   │   ├── add-food.test.ts
│   │   ├── edit-food.test.ts
│   │   └── nutrition-goals.test.ts
│   └── regression/       # Regression test suites
└── fixtures/
    ├── data/             # Test nutrition data
    │   ├── foods.json
    │   └── users.json
    └── mocks/            # Mock implementations
        ├── openai.mock.ts
        └── prisma.mock.ts
```

### Food Tracking Specific Test Quality Standards

#### Nutrition Calculation Tests
```typescript
describe('NutritionCalculator', () => {
  describe('calculateDailyTotals', () => {
    it('should accurately calculate total calories from multiple food entries', () => {
      const entries: FoodLogEntry[] = [
        createMockEntry({ calories: 150, servings: 1 }), // 1 apple
        createMockEntry({ calories: 300, servings: 0.5 }), // half sandwich
        createMockEntry({ calories: 80, servings: 2 }), // 2 cookies
      ];

      const result = calculateDailyTotals(entries);

      expect(result.calories).toBe(460); // 150 + 150 + 160
      expect(result.protein).toBeCloseTo(expectedProtein, 1);
    });

    it('should handle fractional servings correctly', () => {
      const entry = createMockEntry({ calories: 100, servings: 0.75 });
      const result = calculateDailyTotals([entry]);
      expect(result.calories).toBe(75);
    });

    it('should throw error for invalid serving amounts', () => {
      const entry = createMockEntry({ calories: 100, servings: -1 });
      expect(() => calculateDailyTotals([entry])).toThrow(ValidationError);
    });
  });
});
```

#### GraphQL Resolver Tests
```typescript
describe('FoodResolver', () => {
  let resolver: FoodResolver;
  let mockPrisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>();
    resolver = new FoodResolver(mockPrisma);
  });

  describe('addFoodToLog', () => {
    it('should add food entry and return updated log', async () => {
      const input: AddFoodInput = {
        foodId: 'food-123',
        servings: 1.5,
        logDate: new Date('2024-01-15'),
      };

      mockPrisma.foodLogEntry.create.mockResolvedValue(mockLogEntry);

      const result = await resolver.addFoodToLog(input, mockContext);

      expect(result.id).toBe(mockLogEntry.id);
      expect(mockPrisma.foodLogEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          foodId: input.foodId,
          servings: input.servings,
          userId: mockContext.user.id,
        }),
      });
    });
  });
});
```

#### AI Integration Tests
```typescript
describe('FoodAnalyzer', () => {
  let analyzer: FoodAnalyzer;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
    analyzer = new FoodAnalyzer(mockOpenAI);
  });

  it('should extract nutrition data from food description', async () => {
    const description = '1 medium banana';
    const expectedResponse = {
      name: 'Medium Banana',
      nutrition: { calories: 105, protein: 1.3, carbohydrates: 27, fat: 0.3 },
      servingSize: { amount: 1, unit: 'piece' as const },
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(
      createMockOpenAIResponse(expectedResponse)
    );

    const result = await analyzer.analyzeFood(description);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nutrition.calories).toBe(105);
      expect(result.data.servingSize.unit).toBe('piece');
    }
  });

  it('should handle invalid OpenAI responses gracefully', async () => {
    mockOpenAI.chat.completions.create.mockResolvedValue(
      createMockOpenAIResponse({ invalid: 'data' })
    );

    const result = await analyzer.analyzeFood('invalid food');

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(AIAnalysisError);
  });
});
```

## Performance Standards

### Food Tracking Performance Requirements
- **GraphQL Queries**:
  - Simple food lookups: < 100ms
  - Daily nutrition calculations: < 200ms
  - Food search with filters: < 300ms
  - Batch food operations: < 500ms

- **AI Analysis Performance**:
  - OpenAI food analysis: < 3 seconds (with timeout)
  - Nutrition calculation: < 50ms
  - Food description validation: < 10ms

- **Frontend Performance**:
  - Initial page load: < 2 seconds on 3G
  - Food log page render: < 500ms
  - Add food interaction: < 100ms response
  - Nutrition charts render: < 300ms

### Mobile Performance Optimization
```typescript
// Lazy loading for nutrition charts
const NutritionCharts = lazy(() => import('./NutritionCharts'));

// Memoized nutrition calculations
const MemoizedNutritionSummary = memo(({ entries }: { entries: FoodLogEntry[] }) => {
  const nutrition = useMemo(() => calculateDailyTotals(entries), [entries]);
  return <NutritionSummary nutrition={nutrition} />;
});

// Optimized GraphQL queries with field selection
const GET_DAILY_LOG = gql`
  query GetDailyLog($date: Date!) {
    dailyLog(date: $date) {
      id
      entries {
        id
        servings
        food {
          id
          name
          nutrition {
            calories
            protein
            carbohydrates
            fat
          }
        }
      }
    }
  }
`;
```

### Database Performance Guidelines
```sql
-- Ensure proper indexing for food tracking queries
CREATE INDEX idx_food_log_entries_user_date ON food_log_entries(user_id, log_date);
CREATE INDEX idx_foods_name_search ON foods USING gin(to_tsvector('english', name));
CREATE INDEX idx_nutrition_facts_calories ON nutrition_facts(calories);

-- Query optimization for daily nutrition totals
-- Use aggregation at database level when possible
SELECT
  SUM(nf.calories * fle.servings) as total_calories,
  SUM(nf.protein * fle.servings) as total_protein,
  SUM(nf.carbohydrates * fle.servings) as total_carbs,
  SUM(nf.fat * fle.servings) as total_fat
FROM food_log_entries fle
JOIN foods f ON fle.food_id = f.id
JOIN nutrition_facts nf ON f.nutrition_id = nf.id
WHERE fle.user_id = $1 AND fle.log_date = $2;
```

## Security Standards

### Food Tracking Security Requirements
- **Input Validation**: Sanitize all food descriptions before AI analysis
- **API Key Security**: Secure OpenAI API key storage and rotation
- **User Data Protection**: Encrypt sensitive nutrition and health data
- **XSS Prevention**: Sanitize user-generated food names and descriptions
- **Rate Limiting**: Prevent abuse of AI analysis endpoints

### Security Implementation Examples
```typescript
// Input validation for food descriptions
const FOOD_DESCRIPTION_SCHEMA = z.string()
  .min(3, 'Food description too short')
  .max(200, 'Food description too long')
  .regex(/^[a-zA-Z0-9\s.,\-\/()]+$/, 'Invalid characters in food description');

// Secure AI API integration
class SecureAIService {
  private readonly openai: OpenAI;
  private readonly rateLimiter: RateLimiter;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    this.openai = new OpenAI({ apiKey });
    this.rateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each user to 100 requests per windowMs
    });
  }

  async analyzeFood(description: string, userId: string): Promise<FoodAnalysisResult> {
    // Rate limiting
    await this.rateLimiter.check(userId);

    // Input sanitization
    const sanitizedDescription = this.sanitizeFoodDescription(description);

    // Validate input
    const validatedDescription = FOOD_DESCRIPTION_SCHEMA.parse(sanitizedDescription);

    // Make secure API call with timeout
    return this.callOpenAIWithTimeout(validatedDescription, 5000);
  }

  private sanitizeFoodDescription(description: string): string {
    return DOMPurify.sanitize(description.trim());
  }
}

// GraphQL input validation
export const AddFoodInputSchema = z.object({
  foodId: z.string().uuid('Invalid food ID'),
  servings: z.number().min(0.1).max(50, 'Serving amount out of range'),
  logDate: z.date().max(new Date(), 'Cannot log food for future dates'),
});
```

## Accessibility Standards

### WCAG 2.1 AA Compliance for Food Tracking
Target compliance level: WCAG 2.1 AA

#### Key Requirements for Nutrition Interfaces
- **Keyboard Navigation**: All food entry forms and nutrition charts accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels for nutrition values and food items
- **Color Contrast**: Nutrition progress bars and charts meet 4.5:1 contrast ratio
- **Focus Management**: Clear focus indicators on food search and entry forms
- **Alternative Text**: Meaningful descriptions for nutrition charts and food images

### Accessibility Implementation

{% raw %}
```tsx
// Accessible nutrition progress bar
interface NutritionProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
}

const NutritionProgress: React.FC<NutritionProgressProps> = ({
  label, current, target, unit
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const progressId = `progress-${label.toLowerCase()}`;

  return (
    <div className="nutrition-progress">
      <label htmlFor={progressId} className="sr-only">
        {label}: {current} of {target} {unit} ({percentage.toFixed(0)}%)
      </label>
      <div
        id={progressId}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label} progress: ${current} of ${target} ${unit}`}
        className="w-full bg-gray-200 rounded-full h-2.5"
      >
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span aria-hidden="true" className="text-sm text-gray-600">
        {current}/{target} {unit}
      </span>
    </div>
  );
};

// Accessible food search component
const FoodSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="food-search">
      <label htmlFor="food-search-input" className="block text-sm font-medium">
        Search for foods
      </label>
      <input
        id="food-search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., banana, chicken breast, oatmeal"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        aria-describedby="food-search-help"
        aria-expanded={results.length > 0}
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
      />
      <div id="food-search-help" className="text-sm text-gray-500 mt-1">
        Type to search for foods and nutrition information
      </div>

      {results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Food search results"
          className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          {results.map((food, index) => (
            <li
              key={food.id}
              role="option"
              aria-selected={false}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleFoodSelect(food)}
            >
              <div className="font-medium">{food.name}</div>
              <div className="text-sm text-gray-500">
                {food.nutrition.calories} cal per {food.servingSize.amount} {food.servingSize.unit}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```
{% endraw %}

## Food Tracking Specific Quality Gates

### Nutrition Data Quality Gates
```typescript
// Nutrition data validation quality gates
const NUTRITION_QUALITY_GATES = {
  // Calorie validation ranges (per 100g)
  CALORIE_RANGES: {
    min: 0,
    max: 900, // Very high calorie foods like oils
    typical_max: 600, // Most foods under this
  },

  // Macronutrient validation
  MACRONUTRIENT_VALIDATION: {
    // Protein should be 0-100g per 100g food
    protein: { min: 0, max: 100 },
    // Carbs should be 0-100g per 100g food
    carbohydrates: { min: 0, max: 100 },
    // Fat should be 0-100g per 100g food
    fat: { min: 0, max: 100 },
  },

  // Total macronutrients shouldn't exceed reasonable limits
  TOTAL_MACRO_LIMIT: 105, // Allow 5g buffer for rounding
};

function validateNutritionData(nutrition: NutritionFacts): ValidationResult {
  const errors: string[] = [];

  // Validate calorie range
  if (nutrition.calories < NUTRITION_QUALITY_GATES.CALORIE_RANGES.min ||
      nutrition.calories > NUTRITION_QUALITY_GATES.CALORIE_RANGES.max) {
    errors.push(`Calories ${nutrition.calories} outside valid range`);
  }

  // Validate macronutrient ranges
  Object.entries(NUTRITION_QUALITY_GATES.MACRONUTRIENT_VALIDATION).forEach(([macro, range]) => {
    const value = nutrition[macro as keyof NutritionFacts] as number;
    if (value < range.min || value > range.max) {
      errors.push(`${macro} ${value}g outside valid range ${range.min}-${range.max}g`);
    }
  });

  // Validate total macronutrients
  const totalMacros = nutrition.protein + nutrition.carbohydrates + nutrition.fat;
  if (totalMacros > NUTRITION_QUALITY_GATES.TOTAL_MACRO_LIMIT) {
    errors.push(`Total macronutrients ${totalMacros}g exceeds limit`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### AI Response Quality Gates
```typescript
// OpenAI response validation
interface AIResponseQualityGate {
  validateNutritionExtraction(response: any): boolean;
  validateFoodIdentification(response: any): boolean;
  validateServingSize(response: any): boolean;
}

class AIResponseValidator implements AIResponseQualityGate {
  validateNutritionExtraction(response: any): boolean {
    // Check if AI extracted reasonable nutrition values
    if (!response.nutrition) return false;

    const validation = validateNutritionData(response.nutrition);
    return validation.isValid;
  }

  validateFoodIdentification(response: any): boolean {
    // Check if AI properly identified the food
    return typeof response.name === 'string' &&
           response.name.length > 0 &&
           response.name.length < 100;
  }

  validateServingSize(response: any): boolean {
    // Check if serving size is reasonable
    const validUnits = ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'];
    return response.servingSize &&
           typeof response.servingSize.amount === 'number' &&
           response.servingSize.amount > 0 &&
           response.servingSize.amount < 1000 &&
           validUnits.includes(response.servingSize.unit);
  }
}
```

### Cache Efficiency Quality Gates
```typescript
// Performance and cache efficiency monitoring
interface CacheEfficiencyMetrics {
  foodSearchCacheHitRate: number; // Target: >80%
  nutritionCalculationCacheHitRate: number; // Target: >90%
  aiAnalysisCacheHitRate: number; // Target: >70%
  averageResponseTime: number; // Target: <200ms
}

class PerformanceMonitor {
  private metrics: CacheEfficiencyMetrics = {
    foodSearchCacheHitRate: 0,
    nutritionCalculationCacheHitRate: 0,
    aiAnalysisCacheHitRate: 0,
    averageResponseTime: 0,
  };

  checkQualityGates(): QualityGateResult {
    const failures: string[] = [];

    if (this.metrics.foodSearchCacheHitRate < 0.8) {
      failures.push(`Food search cache hit rate ${this.metrics.foodSearchCacheHitRate} below 80% target`);
    }

    if (this.metrics.nutritionCalculationCacheHitRate < 0.9) {
      failures.push(`Nutrition calculation cache hit rate ${this.metrics.nutritionCalculationCacheHitRate} below 90% target`);
    }

    if (this.metrics.averageResponseTime > 200) {
      failures.push(`Average response time ${this.metrics.averageResponseTime}ms above 200ms target`);
    }

    return {
      passed: failures.length === 0,
      failures,
      metrics: this.metrics,
    };
  }
}
```

## Quality Tools and Commands

### Development Commands for Food Tracking Quality
```bash
# Frontend quality commands
cd frontend/
npm run test              # Run Jest + React Testing Library tests
npm run test:coverage     # Generate test coverage report
npm run lint              # ESLint for React/TypeScript
npm run type-check        # TypeScript type checking
npm run build             # Verify build succeeds
npm run accessibility     # Run axe accessibility tests

# Backend quality commands
cd backend/
npm run test              # Run Jest tests for GraphQL/Prisma
npm run test:integration  # Run integration tests
npm run lint              # ESLint for GraphQL/TypeScript
npm run type-check        # TypeScript type checking
npm run db:test           # Test database migrations
npm run security:audit    # Check for vulnerabilities

# End-to-end quality commands
npm run test:e2e          # Playwright end-to-end tests
npm run test:performance  # Performance testing
npm run test:load         # Load testing for GraphQL API

# Quality monitoring
npm run quality:report    # Generate comprehensive quality report
npm run metrics:collect   # Collect performance metrics
```

### Quality Gate Configuration
```yaml
# Quality gates for CI/CD pipeline
quality_gates:
  test_coverage:
    unit_tests: 85%
    integration_tests: 80%
    e2e_tests: 70%

  performance:
    graphql_response_time: 200ms
    frontend_load_time: 2s
    nutrition_calculation: 50ms
    ai_analysis_timeout: 3s

  security:
    critical_vulnerabilities: 0
    high_vulnerabilities: 0
    api_rate_limits: enforced

  accessibility:
    wcag_compliance: AA
    keyboard_navigation: 100%
    screen_reader_compatibility: 100%

  food_tracking_specific:
    nutrition_data_accuracy: 95%
    ai_response_validation: 90%
    cache_hit_rates: 80%
```

## Definition of Done for Food Tracking Features

### Feature Completion Checklist
- [ ] **Functionality**: Feature works for all food tracking scenarios (add, edit, delete, search)
- [ ] **Nutrition Accuracy**: AI-extracted nutrition data validated against quality gates
- [ ] **Performance**: Meets response time targets for nutrition calculations and GraphQL queries
- [ ] **Testing**: Unit tests for nutrition logic, integration tests for AI analysis, E2E tests for user flows
- [ ] **Security**: Input validation for food descriptions, secure API key handling
- [ ] **Accessibility**: WCAG 2.1 AA compliance for nutrition interfaces
- [ ] **Mobile Responsive**: Works on mobile devices with touch-friendly interactions
- [ ] **Documentation**: JSDoc for complex nutrition functions, component documentation
- [ ] **GraphQL Schema**: Proper types and descriptions for food tracking operations
- [ ] **Database Performance**: Optimized queries with proper indexing
- [ ] **Error Handling**: Graceful handling of AI API failures and invalid nutrition data
- [ ] **Cache Efficiency**: Appropriate caching for frequently accessed nutrition data

This quality framework ensures Claude Code maintains high standards while developing food tracking features, with specific attention to nutrition data accuracy, AI integration reliability, and user experience optimization.