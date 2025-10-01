# Task: Food Entry Form with GraphQL Integration

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-005
> **Status**: Not Started
> **Priority**: High
> **Estimated Effort**: 1-2 days
> **Assignee**: Self-directed learning
> **Created**: 2025-10-01
> **Updated**: 2025-10-01

## Task Overview

### Description
Build the core food entry form component with GraphQL mutation integration. Implement basic food logging functionality with manual nutrition input capabilities, form validation, and loading states using the UI components from Task 004.

### Context
This is the primary user interface for food logging functionality. Users will interact with this form multiple times daily, so it needs to be fast, intuitive, and mobile-friendly. Focus on learning form handling patterns, GraphQL mutations, and user experience design.

### Dependencies
- **Prerequisite Tasks**: TASK-002 (GraphQL schema), TASK-003 (Urql setup), TASK-004 (UI components)
- **Blocking Tasks**: AI integration tasks, food suggestion features
- **External Dependencies**: Generated GraphQL hooks, form validation library

## Technical Specifications

### Scope of Changes

#### Component Structure
```
frontend/src/components/
├── food/
│   ├── FoodEntryForm.tsx         # Main food entry form
│   ├── NutritionInputs.tsx       # Nutrition value inputs (collapsible)
│   ├── FoodFormSchema.ts         # Form validation schema
│   └── index.ts                  # Component exports
├── ui/
│   ├── Textarea.tsx              # Multi-line text input
│   ├── NumberInput.tsx           # Number input with validation
│   └── Collapsible.tsx           # Expandable content section
```

#### Form Management
- **Form Library**: React Hook Form for form state management
- **Validation**: Zod schema for TypeScript-first validation
- **GraphQL Integration**: Generated AddFood mutation hook
- **User Experience**: Optimistic updates and loading states

### Implementation Details

#### Form Validation Schema
```typescript
// frontend/src/components/food/FoodFormSchema.ts
import { z } from 'zod';

export const FoodEntrySchema = z.object({
  description: z.string()
    .min(1, 'Food description is required')
    .max(200, 'Description must be less than 200 characters'),
  nutrition: z.object({
    calories: z.number()
      .min(0, 'Calories must be positive')
      .max(10000, 'Calories seems too high')
      .optional(),
    fat: z.number()
      .min(0, 'Fat must be positive')
      .max(1000, 'Fat content seems too high')
      .optional(),
    carbs: z.number()
      .min(0, 'Carbs must be positive')
      .max(1000, 'Carb content seems too high')
      .optional(),
    protein: z.number()
      .min(0, 'Protein must be positive')
      .max(1000, 'Protein content seems too high')
      .optional(),
  }).optional(),
});

export type FoodEntryFormData = z.infer<typeof FoodEntrySchema>;
```

#### Main Food Entry Form Component
```typescript
// frontend/src/components/food/FoodEntryForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NutritionInputs } from './NutritionInputs';
import { FoodEntrySchema, type FoodEntryFormData } from './FoodFormSchema';
import { useAddFoodMutation } from '@/generated/graphql';

interface FoodEntryFormProps {
  onSuccess?: () => void;
}

export function FoodEntryForm({ onSuccess }: FoodEntryFormProps) {
  const [showNutritionInputs, setShowNutritionInputs] = useState(false);
  const [addFoodMutation, addFoodResult] = useAddFoodMutation();

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

  const onSubmit = async (data: FoodEntryFormData) => {
    try {
      const result = await addFoodMutation({
        input: {
          description: data.description,
          nutrition: data.nutrition && Object.values(data.nutrition).some(v => v !== undefined)
            ? data.nutrition
            : undefined,
        },
      });

      if (result.data?.addFood) {
        reset();
        setShowNutritionInputs(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  const hasNutritionData = watch('nutrition') &&
    Object.values(watch('nutrition') || {}).some(v => v !== undefined);

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add Food Entry
          </h3>
        </div>

        <Input
          {...register('description')}
          label="Food Description"
          placeholder="e.g., 2 slices whole wheat toast, 1 large apple"
          error={errors.description?.message}
          helpText="Include quantity and details for better tracking"
        />

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNutritionInputs(!showNutritionInputs)}
            className="w-full"
          >
            {showNutritionInputs ? 'Hide' : 'Add'} Nutrition Information
            {hasNutritionData && (
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                Custom values
              </span>
            )}
          </Button>

          {showNutritionInputs && (
            <NutritionInputs
              register={register}
              errors={errors.nutrition}
              setValue={setValue}
              watch={watch}
            />
          )}
        </div>

        {addFoodResult.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Failed to save food entry. Please try again.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Add Food'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setShowNutritionInputs(false);
            }}
            disabled={isSubmitting}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

#### Nutrition Inputs Component
```typescript
// frontend/src/components/food/NutritionInputs.tsx
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { NumberInput } from '@/components/ui/NumberInput';
import { Card } from '@/components/ui/Card';
import { FoodEntryFormData } from './FoodFormSchema';

interface NutritionInputsProps {
  register: UseFormRegister<FoodEntryFormData>;
  errors?: FieldErrors<NonNullable<FoodEntryFormData['nutrition']>>;
  setValue: UseFormSetValue<FoodEntryFormData>;
  watch: UseFormWatch<FoodEntryFormData>;
}

export function NutritionInputs({
  register,
  errors,
  setValue,
  watch,
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
          <h4 className="text-sm font-medium text-gray-700">
            Nutrition Information
          </h4>
          <button
            type="button"
            onClick={clearAllNutrition}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>

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

        <p className="text-xs text-gray-500">
          Leave fields empty to use AI estimates when available
        </p>
      </div>
    </Card>
  );
}
```

#### Number Input Component
```typescript
// frontend/src/components/ui/NumberInput.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helpText?: string;
  suffix?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, helpText, suffix, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="number"
            step="0.1"
            min="0"
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm',
              'focus:border-primary-500 focus:ring-primary-500',
              'disabled:bg-gray-50 disabled:text-gray-500',
              suffix && 'pr-8',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{suffix}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
```

#### Integration with Main Page
```typescript
// frontend/src/app/page.tsx (updated)
import { AppLayout } from '@/components/layout/AppLayout';
import { FoodEntryForm } from '@/components/food/FoodEntryForm';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Today's Food Log
          </h2>
          <p className="text-gray-600">
            Track your daily nutrition and stay on top of your goals
          </p>
        </div>

        <FoodEntryForm onSuccess={() => {
          // TODO: Refresh food list when implemented
          console.log('Food added successfully!');
        }} />
      </div>
    </AppLayout>
  );
}
```

#### Package Dependencies Update
```json
{
  "dependencies": {
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

## Acceptance Criteria

### Functional Requirements
- [ ] **Food Description Input**: Text input with validation for required field
- [ ] **Optional Nutrition Inputs**: Collapsible section with calories, fat, carbs, protein
- [ ] **Form Validation**: Client-side validation with helpful error messages
- [ ] **GraphQL Integration**: Successfully saves food entries using AddFood mutation
- [ ] **Loading States**: Shows loading spinner and disables form during submission
- [ ] **Error Handling**: Displays user-friendly error messages for failures

### Technical Requirements
- [ ] **Type Safety**: Form data fully typed with Zod schema validation
- [ ] **Responsive Design**: Form works well on mobile and desktop
- [ ] **Accessibility**: Proper labels, error announcements, keyboard navigation
- [ ] **Form State**: Proper reset after successful submission
- [ ] **Optimistic Updates**: Form resets immediately after successful submission

### User Experience Requirements
- [ ] **Mobile-First**: Easy to use on mobile devices with appropriate input types
- [ ] **Visual Feedback**: Clear indication of form state and validation errors
- [ ] **Intuitive Flow**: Logical tab order and clear call-to-action buttons
- [ ] **Helpful Hints**: Placeholder text and help text guide user input

## Testing Strategy

### Component Tests
- **FoodEntryForm Tests**:
  - Test form submission with valid data
  - Test validation error display
  - Test nutrition inputs toggle
  - Test form reset functionality
- **NutritionInputs Tests**:
  - Test number input validation
  - Test clear all functionality
  - Test conditional rendering

### Integration Tests
- **GraphQL Integration**:
  - Test successful food addition
  - Test error handling for failed mutations
  - Test form state during async operations
- **Form Validation**:
  - Test client-side validation rules
  - Test error message display

### Manual Testing Scenarios
1. **Happy Path**: Enter food description, add nutrition, submit successfully
2. **Validation**: Test required fields and number input validation
3. **Mobile Experience**: Test form usability on mobile device
4. **Error Scenarios**: Test with GraphQL server down

## Implementation Notes

### Development Approach
1. **Step 1**: Set up form validation schema with Zod
2. **Step 2**: Create basic form structure with React Hook Form
3. **Step 3**: Add nutrition inputs as collapsible section
4. **Step 4**: Integrate GraphQL mutation with generated hooks
5. **Step 5**: Add loading states and error handling
6. **Step 6**: Test full form workflow and validation

### Learning Focus Areas
- **React Hook Form**: Modern form state management patterns
- **Zod Validation**: TypeScript-first schema validation
- **GraphQL Mutations**: Urql mutation hooks and error handling
- **Form UX**: Loading states, validation feedback, mobile optimization
- **Component Composition**: Reusable form components and patterns

### Potential Challenges
- **Number Input Handling**: Proper validation and formatting for nutrition values
- **Form State Synchronization**: Managing complex nested form state
- **Mobile Input Experience**: Optimizing number inputs for mobile keyboards
- **GraphQL Error Handling**: Proper error display for different failure types

## Definition of Done

### Code Complete
- [ ] Form successfully submits data to GraphQL API
- [ ] All validation rules work correctly
- [ ] Loading and error states properly implemented
- [ ] Form resets after successful submission
- [ ] All components pass TypeScript compilation

### User Experience Complete
- [ ] Form is easy to use on mobile devices
- [ ] Validation provides helpful feedback to users
- [ ] Visual design is consistent with app design system
- [ ] Accessibility requirements met

### Testing Complete
- [ ] Unit tests for form validation and submission
- [ ] Integration tests for GraphQL operations
- [ ] Manual testing on multiple devices
- [ ] Error scenarios properly handled

## Related Tasks

### Follow-up Tasks
- [TASK-006]: Create daily food log display to show added foods
- [TASK-007]: Add food suggestions/typeahead functionality
- [TASK-008]: Integrate OpenAI for automatic nutrition analysis

### Reference Resources
- React Hook Form documentation
- Zod validation library guide
- Urql mutation patterns

## Notes & Comments

### Learning Objectives for This Task
1. **Modern Form Handling**: React Hook Form with TypeScript and validation
2. **Schema Validation**: Zod for type-safe form validation
3. **GraphQL Mutations**: Urql hooks for data mutations and state management
4. **UX Patterns**: Form design, loading states, and error handling

### Key Technologies Learned
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first validation schemas
- **Urql Mutations**: GraphQL mutations with automatic cache updates
- **Mobile UX**: Touch-friendly form inputs and responsive design

---

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-01 | Created | Food entry form with GraphQL integration for learning modern form patterns | Claude |