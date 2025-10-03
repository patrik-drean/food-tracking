# Task: Daily Food Log Display with Real-time Updates ✅ COMPLETED

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-006
> **Status**: ✅ COMPLETED
> **Priority**: High
> **Estimated Effort**: 1 day
> **Assignee**: Self-directed learning
> **Created**: 2025-10-01
> **Updated**: 2025-10-03
> **Completed**: 2025-10-03
> **Verified by**: User confirmed satisfaction

## Task Overview

### Description
Create the daily food log display component that shows today's food entries with running nutrition totals. Implement real-time updates when new foods are added, individual food item editing capabilities, and responsive design for mobile viewing.

### Context
This component displays the results of food logging and provides visual feedback on daily nutrition progress. Users will reference this frequently throughout the day to track their intake. Focus on learning GraphQL queries, real-time updates, and data visualization patterns.

### Dependencies
- **Prerequisite Tasks**: TASK-002 (GraphQL schema), TASK-003 (Urql setup), TASK-004 (UI components), TASK-005 (Food entry form)
- **Blocking Tasks**: AI integration and food suggestions
- **External Dependencies**: Generated GraphQL hooks, food entry data

## Technical Specifications

### Scope of Changes

#### Component Structure
```
frontend/src/components/
├── food/
│   ├── DailyFoodLog.tsx          # Main food log container
│   ├── FoodLogItem.tsx           # Individual food entry display
│   ├── NutritionSummary.tsx      # Daily totals summary
│   ├── EditFoodModal.tsx         # Modal for editing food entries
│   └── EmptyFoodLog.tsx          # Empty state component
├── ui/
│   ├── Modal.tsx                 # Reusable modal component
│   ├── ProgressBar.tsx           # Progress indicator
│   └── Badge.tsx                 # Small status indicators
```

#### Data Management
- **GraphQL Queries**: TodaysFoods query with automatic refetching
- **Real-time Updates**: Urql cache updates after mutations
- **Local State**: Modal state and edit form management
- **Optimistic Updates**: Immediate UI updates before server confirmation

### Implementation Details

#### Daily Food Log Container
```typescript
// frontend/src/components/food/DailyFoodLog.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FoodLogItem } from './FoodLogItem';
import { NutritionSummary } from './NutritionSummary';
import { EmptyFoodLog } from './EmptyFoodLog';
import { EditFoodModal } from './EditFoodModal';
import { useTodaysFoodsQuery, type Food } from '@/generated/graphql';

export function DailyFoodLog() {
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [{ data, fetching, error }] = useTodaysFoodsQuery({
    requestPolicy: 'cache-and-network',
  });

  if (fetching && !data) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading today's foods...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load food log</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const foods = data?.todaysFoods || [];
  const totalNutrition = calculateTotalNutrition(foods);

  if (foods.length === 0) {
    return <EmptyFoodLog />;
  }

  return (
    <>
      <div className="space-y-4">
        <NutritionSummary nutrition={totalNutrition} />

        <Card>
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Today's Food Log ({foods.length} {foods.length === 1 ? 'item' : 'items'})
            </h3>

            <div className="space-y-2">
              {foods.map((food) => (
                <FoodLogItem
                  key={food.id}
                  food={food}
                  onEdit={() => setEditingFood(food)}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          isOpen={true}
          onClose={() => setEditingFood(null)}
          onSuccess={() => setEditingFood(null)}
        />
      )}
    </>
  );
}

function calculateTotalNutrition(foods: Food[]) {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + (food.calories || 0),
      protein: total.protein + (food.protein || 0),
      carbs: total.carbs + (food.carbs || 0),
      fat: total.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
```

#### Individual Food Item Component
```typescript
// frontend/src/components/food/FoodLogItem.tsx
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { type Food } from '@/generated/graphql';

interface FoodLogItemProps {
  food: Food;
  onEdit: () => void;
}

export function FoodLogItem({ food, onEdit }: FoodLogItemProps) {
  const hasNutrition = food.calories || food.protein || food.carbs || food.fat;
  const timeAgo = formatDistanceToNow(new Date(food.createdAt), { addSuffix: true });

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {food.description}
          </p>
          {food.isManual && (
            <Badge variant="secondary" size="sm">
              Manual
            </Badge>
          )}
        </div>

        {hasNutrition ? (
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {food.calories && (
              <span>{Math.round(food.calories)} cal</span>
            )}
            {food.protein && (
              <span className="text-food-protein">{food.protein}g protein</span>
            )}
            {food.carbs && (
              <span className="text-food-carbs">{food.carbs}g carbs</span>
            )}
            {food.fat && (
              <span className="text-food-fat">{food.fat}g fat</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No nutrition data</p>
        )}

        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="ml-2 flex-shrink-0"
      >
        Edit
      </Button>
    </div>
  );
}
```

#### Nutrition Summary Component
```typescript
// frontend/src/components/food/NutritionSummary.tsx
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface NutritionSummaryProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Daily targets (could be made configurable later)
const DAILY_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
};

export function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const macroTotal = nutrition.protein + nutrition.carbs + nutrition.fat;

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Daily Summary</h3>

        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Calories</span>
            <span className="text-sm text-gray-600">
              {Math.round(nutrition.calories)} / {DAILY_TARGETS.calories}
            </span>
          </div>
          <ProgressBar
            value={nutrition.calories}
            max={DAILY_TARGETS.calories}
            color="red"
            size="lg"
          />
        </div>

        {/* Macronutrients */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-food-protein">Protein</span>
              <span className="text-xs text-gray-600">{nutrition.protein}g</span>
            </div>
            <ProgressBar
              value={nutrition.protein}
              max={DAILY_TARGETS.protein}
              color="blue"
              size="sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-food-carbs">Carbs</span>
              <span className="text-xs text-gray-600">{nutrition.carbs}g</span>
            </div>
            <ProgressBar
              value={nutrition.carbs}
              max={DAILY_TARGETS.carbs}
              color="yellow"
              size="sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-food-fat">Fat</span>
              <span className="text-xs text-gray-600">{nutrition.fat}g</span>
            </div>
            <ProgressBar
              value={nutrition.fat}
              max={DAILY_TARGETS.fat}
              color="purple"
              size="sm"
            />
          </div>
        </div>

        {macroTotal > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Macros: {Math.round((nutrition.protein / macroTotal) * 100)}% protein,{' '}
              {Math.round((nutrition.carbs / macroTotal) * 100)}% carbs,{' '}
              {Math.round((nutrition.fat / macroTotal) * 100)}% fat
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
```

#### Edit Food Modal Component
```typescript
// frontend/src/components/food/EditFoodModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import { FoodEntrySchema, type FoodEntryFormData } from './FoodFormSchema';
import { useUpdateFoodNutritionMutation, type Food } from '@/generated/graphql';

interface EditFoodModalProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFoodModal({
  food,
  isOpen,
  onClose,
  onSuccess,
}: EditFoodModalProps) {
  const [updateFoodMutation, updateResult] = useUpdateFoodNutritionMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Pick<FoodEntryFormData, 'nutrition'>>({
    resolver: zodResolver(FoodEntrySchema.pick({ nutrition: true })),
    defaultValues: {
      nutrition: {
        calories: food.calories || undefined,
        fat: food.fat || undefined,
        carbs: food.carbs || undefined,
        protein: food.protein || undefined,
      },
    },
  });

  const onSubmit = async (data: Pick<FoodEntryFormData, 'nutrition'>) => {
    if (!data.nutrition) return;

    try {
      const result = await updateFoodMutation({
        input: {
          id: food.id,
          nutrition: data.nutrition,
        },
      });

      if (result.data?.updateFoodNutrition) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to update food:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Nutrition">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            <strong>{food.description}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            {...register('nutrition.calories', { valueAsNumber: true })}
            label="Calories"
            placeholder="0"
            error={errors.nutrition?.calories?.message}
            suffix="cal"
          />

          <NumberInput
            {...register('nutrition.protein', { valueAsNumber: true })}
            label="Protein"
            placeholder="0"
            error={errors.nutrition?.protein?.message}
            suffix="g"
          />

          <NumberInput
            {...register('nutrition.carbs', { valueAsNumber: true })}
            label="Carbs"
            placeholder="0"
            error={errors.nutrition?.carbs?.message}
            suffix="g"
          />

          <NumberInput
            {...register('nutrition.fat', { valueAsNumber: true })}
            label="Fat"
            placeholder="0"
            error={errors.nutrition?.fat?.message}
            suffix="g"
          />
        </div>

        {updateResult.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Failed to update nutrition data. Please try again.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

#### Progress Bar Component

{% raw %}
```typescript
// frontend/src/components/ui/ProgressBar.tsx
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'red' | 'blue' | 'yellow' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max,
  color = 'green',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    red: 'bg-food-calories',
    blue: 'bg-food-protein',
    yellow: 'bg-food-carbs',
    purple: 'bg-food-fat',
    green: 'bg-primary-500',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn(
      'w-full bg-gray-200 rounded-full overflow-hidden',
      sizeClasses[size],
      className
    )}>
      <div
        className={cn(
          'h-full transition-all duration-300 ease-out',
          colorClasses[color]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
```
{% endraw %}

#### Empty State Component
```typescript
// frontend/src/components/food/EmptyFoodLog.tsx
import { Card } from '@/components/ui/Card';

export function EmptyFoodLog() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No foods logged today
        </h3>
        <p className="text-gray-600 mb-6">
          Start by adding your first meal or snack above
        </p>
      </div>
    </Card>
  );
}
```

#### Updated Main Page Integration
```typescript
// frontend/src/app/page.tsx (updated)
import { AppLayout } from '@/components/layout/AppLayout';
import { FoodEntryForm } from '@/components/food/FoodEntryForm';
import { DailyFoodLog } from '@/components/food/DailyFoodLog';

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

        <FoodEntryForm />

        <DailyFoodLog />
      </div>
    </AppLayout>
  );
}
```

## Acceptance Criteria

### Functional Requirements
- [x] **Food List Display**: Compact list view (no timestamps per user request) ✅
- [x] **Nutrition Summary**: Minimal numbers design with color coding (green/amber/red) ✅
- [x] **Real-time Updates**: Urql cache updates via reexecuteQuery ✅
- [x] **Edit Functionality**: EditFoodModal with validation and GraphQL mutation ✅
- [x] **Delete Functionality**: DELETE_FOOD_MUTATION with confirmation dialog ✅
- [x] **Empty State**: Friendly emoji + message component ✅

### Technical Requirements
- [x] **GraphQL Integration**: TodaysFoods query with cache-and-network policy ✅
- [x] **Responsive Design**: Grid layouts (2 cols mobile, 4 cols desktop) ✅
- [x] **Loading States**: LoadingSpinner during data fetching ✅
- [x] **Error Handling**: Error boundary with retry button ✅
- [x] **Performance**: Proper React patterns with efficient re-rendering ✅

### User Experience Requirements
- [x] **Visual Hierarchy**: Card-based separation between components ✅
- [x] **Quick Actions**: Inline Edit/Delete buttons on each food item ✅
- [x] **Information Density**: Compact nutrition display (320 cal • 18g P • 24g C • 12g F) ✅
- [x] **Color Coding**: Green (70-100%), Amber (100-120%), Red (>120%) ✅

## Testing Strategy

### Component Tests
- **DailyFoodLog Tests**:
  - Test empty state rendering
  - Test food list rendering with data
  - Test edit modal opening and closing
- **FoodLogItem Tests**:
  - Test nutrition display formatting
  - Test manual vs AI badge display
  - Test edit button functionality
- **NutritionSummary Tests**:
  - Test total calculations
  - Test progress bar percentages

### Integration Tests
- **GraphQL Integration**:
  - Test query data fetching and display
  - Test cache updates after mutations
  - Test error handling for failed queries
- **Real-time Updates**:
  - Test list updates after adding new food
  - Test summary updates after editing food

### Manual Testing Scenarios
1. **Full Workflow**: Add food, see it appear in list, edit nutrition, verify updates
2. **Empty State**: Test with no food logged
3. **Mobile Experience**: Test on mobile device for usability
4. **Progress Tracking**: Add foods and verify progress calculations

## Implementation Notes

### Development Approach
1. **Step 1**: Create basic food list display with mock data
2. **Step 2**: Integrate TodaysFoods query and handle loading states
3. **Step 3**: Add nutrition summary with progress bars
4. **Step 4**: Implement edit modal with UpdateFoodNutrition mutation
5. **Step 5**: Add real-time updates and cache management
6. **Step 6**: Polish mobile experience and empty states

### Learning Focus Areas
- **GraphQL Queries**: Urql query hooks and caching strategies
- **Real-time Updates**: Cache updates after mutations
- **Data Visualization**: Progress bars and nutrition summaries
- **Modal Patterns**: Overlay components and form integration
- **Mobile UX**: Touch-friendly interfaces and responsive design

### Potential Challenges
- **Cache Synchronization**: Ensuring UI updates after mutations
- **Performance**: Efficient re-rendering with large food lists
- **Mobile Layout**: Fitting nutrition information on small screens
- **Time Formatting**: Proper relative time display

## Definition of Done

### Code Complete
- [x] Food log displays correctly with real data from GraphQL ✅
- [x] Nutrition summary calculates totals accurately with color coding ✅
- [x] Edit and delete functionality work with proper validation ✅
- [x] Real-time updates work after adding/editing/deleting foods ✅
- [x] All components pass TypeScript compilation (0 errors) ✅

### User Experience Complete
- [x] Mobile-responsive design works across device sizes ✅
- [x] Loading and error states provide good user feedback ✅
- [x] Edit/delete workflow is intuitive and efficient ✅
- [x] Color-coded nutrition display is clear and helpful ✅

### Testing Complete
- [x] TypeScript compilation verified (frontend + backend) ✅
- [x] GraphQL operations tested (query + mutations) ✅
- [x] Production build successful (131kB bundle) ✅
- [x] Manual testing completed with dev server ✅

## Related Tasks

### Follow-up Tasks
- [TASK-007]: Add food suggestions and typeahead functionality
- [TASK-008]: Integrate OpenAI for nutrition analysis
- [TASK-009]: Add daily goals configuration

### Reference Resources
- Date-fns for time formatting
- Urql caching documentation
- React Hook Form modal patterns

## Notes & Comments

### Learning Objectives for This Task
1. **GraphQL Queries**: Understanding query hooks, caching, and real-time updates
2. **Data Visualization**: Creating progress indicators and summary calculations
3. **Modal Patterns**: Overlay components and form integration
4. **Mobile UX**: Responsive design for data-heavy interfaces

### Key Technologies Learned
- **Urql Caching**: Query caching and automatic updates
- **React Patterns**: List rendering, modal state management
- **Data Calculation**: Aggregating nutrition data from arrays
- **Responsive Design**: Mobile-first layout for complex data

---

## Implementation Summary

### Design Chosen: Compact List View with Color Coding

**Why This Design:**
- Clean, minimal UI focused on information density
- No timestamps (per user request) for cleaner display
- Color-coded nutrition values for quick visual feedback
- Mobile-first responsive grid layout

### Components Implemented

**Food Display Components:**
- `DailyFoodLog.tsx` - Main container with GraphQL integration and real-time updates
- `FoodLogItem.tsx` - Compact list item with inline Edit/Delete actions
- `NutritionSummary.tsx` - Minimal numbers display with dynamic color coding
- `EmptyFoodLog.tsx` - Friendly empty state with emoji
- `EditFoodModal.tsx` - Modal for editing nutrition values

**UI Components:**
- `Badge.tsx` - Status indicators (Manual/AI labels)
- `Modal.tsx` - Reusable modal dialog component

### Key Features Delivered

**Core Functionality:**
- Real-time food log display using `todaysFoods` GraphQL query
- Automatic cache updates via Urql `cache-and-network` policy
- Edit nutrition values with validation (UpdateFoodNutrition mutation)
- Delete food entries with confirmation dialog (DeleteFood mutation)
- Empty state handling with helpful messaging

**Color Coding System:**
```typescript
// Green: 70-100% of goal (good progress)
// Amber: 100-120% of goal (approaching/at limit)
// Red: >120% of goal (over limit)
// Gray: <70% of goal (low)
```

**UX Enhancements:**
- Loading spinner during data fetch
- Error boundary with retry functionality
- Responsive grid (2 cols mobile, 4 cols desktop)
- Confirmation dialogs for destructive actions
- Inline action buttons for quick access

### Build Metrics

**Bundle Impact:**
- Homepage: 131kB total (includes all food log functionality)
- 7 new components totaling ~16KB source code

**Quality Metrics:**
- TypeScript: 0 errors (strict mode)
- Production build: Success
- All acceptance criteria: ✅ Met

### Dependencies Added
- No new dependencies (uses existing Urql, React Hook Form, Zod)

---

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-01 | Created | Daily food log display for learning GraphQL queries and data visualization | Claude |
| 2025-10-03 | ✅ COMPLETED | All acceptance criteria met, compact list view with color coding implemented, user confirmed satisfaction | Claude Code |