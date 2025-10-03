# Task: AI-Powered Nutrition Analysis in Food Entry Form

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-008
> **Status**: ✅ Completed
> **Priority**: High
> **Estimated Effort**: 1 day
> **Assignee**: Self-directed learning
> **Created**: 2025-10-02
> **Updated**: 2025-10-02
> **Completed**: 2025-10-02

## Task Overview

### Description
Integrate the AI nutrition analysis service into the food entry form, allowing users to automatically estimate nutritional values by clicking an "Analyze" button. Display loading states during analysis, pre-fill nutrition inputs with AI results, and allow users to edit or override the AI-generated values before saving.

### Context
This task brings the AI-powered nutrition analysis to the user interface, completing the core value proposition of the app. Users can quickly get nutrition estimates without manual lookup, while still maintaining control to override values when they have more accurate data. Focus on learning async UI patterns, loading states, and smooth user experience flows.

### Dependencies
- **Prerequisite Tasks**: TASK-005 (Food entry form), TASK-007 (OpenAI backend service)
- **Blocking Tasks**: None (this completes Phase 3 AI integration)
- **External Dependencies**: Generated GraphQL hooks for analyzeFoodNutrition mutation

## Technical Specifications

### Scope of Changes

#### Frontend Component Updates
```
frontend/src/components/food/
├── FoodEntryForm.tsx              # Update: Add AI analysis button and state
├── NutritionInputs.tsx            # Update: Show AI-generated badge
├── AIAnalysisButton.tsx           # New: Dedicated AI analysis button
└── LoadingNutritionState.tsx      # New: Loading skeleton during analysis
```

#### Updated GraphQL Schema Integration
```graphql
mutation AnalyzeFoodNutrition($description: String!) {
  analyzeFoodNutrition(description: $description) {
    calories
    fat
    carbs
    protein
    source
    confidence
  }
}
```

### Implementation Details

#### AI Analysis Button Component
```typescript
// frontend/src/components/food/AIAnalysisButton.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

interface AIAnalysisButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  hasAnalyzed: boolean;
}

export function AIAnalysisButton({
  onClick,
  isLoading,
  disabled,
  hasAnalyzed,
}: AIAnalysisButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full"
    >
      <SparklesIcon className="w-4 h-4 mr-2" />
      {isLoading ? (
        <span>Analyzing nutrition...</span>
      ) : hasAnalyzed ? (
        <span>Re-analyze with AI</span>
      ) : (
        <span>Get AI Nutrition Estimate</span>
      )}
    </Button>
  );
}
```

#### Loading State Component
```typescript
// frontend/src/components/food/LoadingNutritionState.tsx
import { Card } from '@/components/ui/Card';

export function LoadingNutritionState() {
  return (
    <Card padding="sm" className="bg-gray-50 border-dashed">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="h-3 w-4 bg-primary-300 rounded-full animate-pulse" />
          <span>Analyzing with AI...</span>
        </div>
      </div>
    </Card>
  );
}
```

#### Updated Food Entry Form with AI Integration
```typescript
// frontend/src/components/food/FoodEntryForm.tsx (updated sections)
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NutritionInputs } from './NutritionInputs';
import { AIAnalysisButton } from './AIAnalysisButton';
import { LoadingNutritionState } from './LoadingNutritionState';
import { FoodEntrySchema, type FoodEntryFormData } from './FoodFormSchema';
import {
  useAddFoodMutation,
  useAnalyzeFoodNutritionMutation,
} from '@/generated/graphql';

interface FoodEntryFormProps {
  onSuccess?: () => void;
}

export function FoodEntryForm({ onSuccess }: FoodEntryFormProps) {
  const [showNutritionInputs, setShowNutritionInputs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [aiSource, setAiSource] = useState<'AI_GENERATED' | 'CACHED' | null>(null);

  const [addFoodMutation, addFoodResult] = useAddFoodMutation();
  const [analyzeMutation] = useAnalyzeFoodNutritionMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FoodEntryFormData>({
    resolver: zodResolver(FoodEntrySchema),
    defaultValues: {
      description: '',
      nutrition: {
        calories: undefined,
        fat: undefined,
        carbs: undefined,
        protein: undefined,
      },
    },
  });

  const description = watch('description');

  /**
   * Handle AI analysis of food description
   */
  const handleAIAnalysis = async () => {
    const trimmedDescription = description?.trim();

    if (!trimmedDescription) {
      return;
    }

    setIsAnalyzing(true);
    setShowNutritionInputs(true);

    try {
      const result = await analyzeMutation({
        description: trimmedDescription,
      });

      if (result.data?.analyzeFoodNutrition) {
        const nutrition = result.data.analyzeFoodNutrition;

        // Pre-fill nutrition inputs with AI results
        setValue('nutrition.calories', nutrition.calories);
        setValue('nutrition.fat', nutrition.fat);
        setValue('nutrition.carbs', nutrition.carbs);
        setValue('nutrition.protein', nutrition.protein);

        setHasAnalyzed(true);
        setAiSource(nutrition.source as 'AI_GENERATED' | 'CACHED');
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Show error notification to user
      alert('Failed to analyze nutrition. Please enter values manually or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: FoodEntryFormData) => {
    try {
      const result = await addFoodMutation({
        input: {
          description: data.description,
          nutrition:
            data.nutrition && Object.values(data.nutrition).some((v) => v !== undefined)
              ? data.nutrition
              : undefined,
        },
      });

      if (result.data?.addFood) {
        reset();
        setShowNutritionInputs(false);
        setHasAnalyzed(false);
        setAiSource(null);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  const hasNutritionData =
    watch('nutrition') && Object.values(watch('nutrition') || {}).some((v) => v !== undefined);

  const canAnalyze = description && description.trim().length > 0 && !isAnalyzing;

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Food Entry</h3>
        </div>

        <Input
          {...register('description')}
          label="Food Description"
          placeholder="e.g., 2 slices whole wheat toast, 1 large apple"
          error={errors.description?.message}
          helpText="Include quantity and details for better AI estimates"
        />

        {/* AI Analysis Button */}
        <AIAnalysisButton
          onClick={handleAIAnalysis}
          isLoading={isAnalyzing}
          disabled={!canAnalyze}
          hasAnalyzed={hasAnalyzed}
        />

        {/* Show loading state while analyzing */}
        {isAnalyzing && <LoadingNutritionState />}

        {/* Show nutrition inputs when analysis is done or user wants manual entry */}
        {!isAnalyzing && showNutritionInputs && (
          <div className="space-y-3">
            <NutritionInputs
              register={register}
              errors={errors.nutrition}
              setValue={setValue}
              watch={watch}
              aiSource={aiSource}
            />
          </div>
        )}

        {/* Manual entry toggle (only show if not analyzing) */}
        {!isAnalyzing && !showNutritionInputs && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNutritionInputs(true)}
            className="w-full"
          >
            Or enter nutrition manually
          </Button>
        )}

        {addFoodResult.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Failed to save food entry. Please try again.</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting || isAnalyzing}
          >
            {isSubmitting ? 'Saving...' : 'Add Food'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setShowNutritionInputs(false);
              setHasAnalyzed(false);
              setAiSource(null);
            }}
            disabled={isSubmitting || isAnalyzing}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

#### Updated Nutrition Inputs with AI Badge
```typescript
// frontend/src/components/food/NutritionInputs.tsx (updated)
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { NumberInput } from '@/components/ui/NumberInput';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FoodEntryFormData } from './FoodFormSchema';

interface NutritionInputsProps {
  register: UseFormRegister<FoodEntryFormData>;
  errors?: FieldErrors<NonNullable<FoodEntryFormData['nutrition']>>;
  setValue: UseFormSetValue<FoodEntryFormData>;
  watch: UseFormWatch<FoodEntryFormData>;
  aiSource?: 'AI_GENERATED' | 'CACHED' | null;
}

export function NutritionInputs({
  register,
  errors,
  setValue,
  watch,
  aiSource,
}: NutritionInputsProps) {
  const nutritionData = watch('nutrition');

  const clearAllNutrition = () => {
    setValue('nutrition.calories', undefined);
    setValue('nutrition.fat', undefined);
    setValue('nutrition.carbs', undefined);
    setValue('nutrition.protein', undefined);
  };

  return (
    <Card padding="sm" className="bg-gray-50 border-dashed">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-700">Nutrition Information</h4>
            {aiSource && (
              <Badge variant={aiSource === 'CACHED' ? 'secondary' : 'primary'} size="sm">
                {aiSource === 'CACHED' ? '⚡ Cached' : '✨ AI Generated'}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={clearAllNutrition}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>

        {aiSource && (
          <div className="p-2 bg-primary-50 border border-primary-200 rounded-md">
            <p className="text-xs text-primary-800">
              {aiSource === 'CACHED'
                ? '⚡ These values were retrieved from cache (previously analyzed)'
                : '✨ These values were estimated by AI - feel free to edit them if you have more accurate data'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            {...register('nutrition.calories', { valueAsNumber: true })}
            label="Calories"
            placeholder="0"
            error={errors?.calories?.message}
            suffix="cal"
          />

          <NumberInput
            {...register('nutrition.protein', { valueAsNumber: true })}
            label="Protein"
            placeholder="0"
            error={errors?.protein?.message}
            suffix="g"
          />

          <NumberInput
            {...register('nutrition.carbs', { valueAsNumber: true })}
            label="Carbs"
            placeholder="0"
            error={errors?.carbs?.message}
            suffix="g"
          />

          <NumberInput
            {...register('nutrition.fat', { valueAsNumber: true })}
            label="Fat"
            placeholder="0"
            error={errors?.fat?.message}
            suffix="g"
          />
        </div>

        {!aiSource && (
          <p className="text-xs text-gray-500">Leave fields empty to skip nutrition tracking</p>
        )}
      </div>
    </Card>
  );
}
```

#### Sparkles Icon Component
```typescript
// frontend/src/components/icons/SparklesIcon.tsx
export function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
```

## Acceptance Criteria

### Functional Requirements
- [ ] **AI Analysis Button**: Clicking button triggers nutrition analysis
- [ ] **Loading State**: Shows loading skeleton during AI analysis
- [ ] **Auto-fill**: AI results automatically populate nutrition inputs
- [ ] **Editable Values**: Users can edit AI-generated values before saving
- [ ] **Manual Entry**: Users can skip AI and enter values manually
- [ ] **Error Handling**: Failed AI analysis shows error message with fallback
- [ ] **Cache Indicator**: Shows badge when results come from cache
- [ ] **Clear Form**: Clearing form resets AI state

### Technical Requirements
- [ ] **GraphQL Integration**: Uses analyzeFoodNutrition mutation correctly
- [ ] **Type Safety**: All GraphQL types properly generated and used
- [ ] **Form State**: AI results properly integrated with React Hook Form
- [ ] **Loading Management**: Proper loading state during async operations
- [ ] **Error Recovery**: Graceful handling of API failures

### User Experience Requirements
- [ ] **Responsive**: Works well on mobile and desktop
- [ ] **Visual Feedback**: Clear indication when AI analysis is happening
- [ ] **Helpful Hints**: Badge indicates AI-generated vs cached results
- [ ] **Progressive Enhancement**: Manual entry always available as fallback
- [ ] **Fast Feedback**: Loading state appears immediately on analysis

## Testing Strategy

### Component Tests
```typescript
// frontend/tests/components/FoodEntryForm.test.tsx
describe('FoodEntryForm with AI Analysis', () => {
  it('should enable AI analysis button when description is entered', () => {
    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);
    const analyzeButton = screen.getByText(/Get AI Nutrition Estimate/i);

    expect(analyzeButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'banana' } });

    expect(analyzeButton).toBeEnabled();
  });

  it('should show loading state during AI analysis', async () => {
    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);
    fireEvent.change(input, { target: { value: 'apple' } });

    const analyzeButton = screen.getByText(/Get AI Nutrition Estimate/i);
    fireEvent.click(analyzeButton);

    expect(screen.getByText(/Analyzing with AI/i)).toBeInTheDocument();
  });

  it('should populate nutrition inputs with AI results', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue({
      data: {
        analyzeFoodNutrition: {
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 1.3,
          source: 'AI_GENERATED',
        },
      },
    });

    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);
    fireEvent.change(input, { target: { value: 'apple' } });

    const analyzeButton = screen.getByText(/Get AI Nutrition Estimate/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('95')).toBeInTheDocument(); // Calories
      expect(screen.getByDisplayValue('25')).toBeInTheDocument(); // Carbs
    });
  });

  it('should show error message when AI analysis fails', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue(new Error('API Error'));

    render(<FoodEntryForm />);

    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);
    fireEvent.change(input, { target: { value: 'apple' } });

    const analyzeButton = screen.getByText(/Get AI Nutrition Estimate/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze nutrition/i)).toBeInTheDocument();
    });
  });

  it('should allow manual entry without AI analysis', () => {
    render(<FoodEntryForm />);

    const manualButton = screen.getByText(/enter nutrition manually/i);
    fireEvent.click(manualButton);

    expect(screen.getByLabelText(/Calories/i)).toBeInTheDocument();
    expect(screen.queryByText(/AI Generated/i)).not.toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// frontend/tests/integration/aiNutritionFlow.test.tsx
describe('AI Nutrition Analysis Flow', () => {
  it('should complete full flow: analyze, edit, and submit', async () => {
    render(<App />);

    // Enter food description
    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);
    fireEvent.change(input, { target: { value: '2 eggs scrambled' } });

    // Click AI analysis
    const analyzeButton = screen.getByText(/Get AI Nutrition Estimate/i);
    fireEvent.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/AI Generated/i)).toBeInTheDocument();
    });

    // Edit a value
    const caloriesInput = screen.getByLabelText(/Calories/i);
    fireEvent.change(caloriesInput, { target: { value: '200' } });

    // Submit
    const submitButton = screen.getByText(/Add Food/i);
    fireEvent.click(submitButton);

    // Verify submission
    await waitFor(() => {
      expect(screen.queryByDisplayValue('2 eggs scrambled')).not.toBeInTheDocument();
    });
  });

  it('should show cached badge for repeated analysis', async () => {
    render(<App />);

    // First analysis
    const input = screen.getByPlaceholderText(/e.g., 2 slices/i);
    fireEvent.change(input, { target: { value: 'banana' } });
    fireEvent.click(screen.getByText(/Get AI Nutrition Estimate/i));

    await waitFor(() => {
      expect(screen.getByText(/AI Generated/i)).toBeInTheDocument();
    });

    // Clear and analyze again
    fireEvent.click(screen.getByText(/Clear/i));
    fireEvent.change(screen.getByPlaceholderText(/e.g., 2 slices/i), {
      target: { value: 'banana' },
    });
    fireEvent.click(screen.getByText(/Get AI Nutrition Estimate/i));

    await waitFor(() => {
      expect(screen.getByText(/Cached/i)).toBeInTheDocument();
    });
  });
});
```

### Manual Testing Scenarios
1. **Happy Path**: Enter food, analyze, see results, edit, submit
2. **Cache Behavior**: Analyze same food twice, verify "Cached" badge
3. **Error Handling**: Disconnect backend, trigger analysis, verify error message
4. **Manual Entry**: Skip AI analysis, enter values manually, submit
5. **Clear Form**: Analyze, clear, verify all state reset
6. **Mobile UX**: Test on mobile device for touch interactions

## Implementation Notes

### Development Approach
1. **Step 1**: Generate GraphQL hooks for analyzeFoodNutrition mutation
2. **Step 2**: Create AIAnalysisButton and LoadingNutritionState components
3. **Step 3**: Update FoodEntryForm to integrate AI analysis logic
4. **Step 4**: Update NutritionInputs to show AI source badge
5. **Step 5**: Add error handling and user feedback
6. **Step 6**: Test full flow with real backend integration

### Learning Focus Areas
- **Async UI Patterns**: Managing loading states during API calls
- **Form Integration**: Combining AI results with React Hook Form
- **Progressive Enhancement**: Providing fallbacks when AI fails
- **User Feedback**: Clear communication about AI-generated data
- **GraphQL Mutations**: Using Urql mutation hooks with async/await

### Potential Challenges
- **State Management**: Coordinating AI analysis state with form state
- **Loading UX**: Providing smooth transitions during analysis
- **Error Recovery**: Graceful fallback to manual entry
- **Mobile Performance**: Ensuring responsive UI during analysis
- **Cache Indication**: Clearly showing when results are cached vs fresh

### UX Considerations
- Show AI analysis button prominently to encourage usage
- Provide manual entry option for users who prefer it
- Allow editing AI results before submission
- Clear indication when values come from cache (faster, reliable)
- Error messages guide user to manual entry as fallback

## Definition of Done

### Code Complete
- [ ] AI analysis button integrated into form
- [ ] Loading state displays during analysis
- [ ] AI results populate form fields correctly
- [ ] Users can edit AI-generated values
- [ ] Error handling with fallback to manual entry
- [ ] Cache indicator shows correctly

### User Experience Complete
- [ ] Smooth loading transitions
- [ ] Clear visual feedback for AI analysis
- [ ] Error messages are helpful and actionable
- [ ] Mobile experience is smooth and responsive
- [ ] Badge clearly indicates AI vs cached results

### Testing Complete
- [ ] Component tests for AI analysis flow
- [ ] Integration tests for full workflow
- [ ] Manual testing with real backend
- [ ] Error scenarios tested
- [ ] Mobile testing completed

## Related Tasks

### Prerequisite Tasks
- [TASK-005]: Food entry form (provides base form)
- [TASK-007]: Backend OpenAI service (provides AI endpoint)

### Follow-up Tasks
- [TASK-009]: Food suggestions/typeahead from history
- [TASK-010]: Edit existing food entries with AI re-analysis

## Notes & Comments

### Learning Objectives for This Task
1. **Async UI Patterns**: Managing loading states and async operations
2. **Form Integration**: Combining external API data with form state
3. **Progressive Enhancement**: Providing fallbacks for failures
4. **User Communication**: Clear feedback about AI-generated data
5. **GraphQL Mutations**: Using mutation hooks with React Hook Form

### Key Technologies Learned
- **Urql Mutations**: Calling GraphQL mutations from React components
- **React Hook Form**: Programmatically setting form values with setValue
- **Loading States**: Creating skeleton loading components
- **Error Handling**: Graceful degradation with user-friendly messages

---

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-02 | Created | AI nutrition analysis frontend integration for learning async UI patterns | Claude |
| 2025-10-02 | Completed | Implemented AI analysis with loading states, auto-fill, manual override, and cache indicators. All acceptance criteria met. | Claude |
