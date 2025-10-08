# Task: Customizable Macro Targets

> **Task ID**: TASK-012
> **Status**: Pending
> **Priority**: Medium
> **Estimated Effort**: 1-2 days
> **Created**: 2025-10-08
> **Dependencies**: TASK-010 (Multi-user authentication must be complete)

## Task Overview

### Description
Allow users to customize their daily nutrition targets (calories, protein, carbs, fat) instead of using hardcoded values. Add an edit icon to the NutritionSummary component that opens a modal for setting macro targets. Store targets in the database per user with sensible defaults based on current hardcoded values.

### Context
The NutritionSummary component currently displays hardcoded daily targets (2600 cal, 170g protein, 310g carbs, 75g fat) in `frontend/src/components/food/NutritionSummary.tsx:12-17`. Users have different nutritional goals based on their fitness objectives, body composition, and activity levels. This feature enables personalized nutrition tracking by allowing each user to set their own macro targets while maintaining the current text-only display format.

### Dependencies
- **Prerequisite Tasks**: TASK-010 (Multi-user authentication with User table)
- **Blocking Tasks**: None
- **External Dependencies**: None

## Technical Specifications

### Scope of Changes

#### Project Structure
```
food-tracking/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                           # MODIFY: Add MacroTargets model
│   │   └── migrations/
│   │       └── [timestamp]_add_macro_targets/      # NEW: Migration for macro targets
│   ├── src/
│   │   ├── schema/
│   │   │   └── types/
│   │   │       ├── MacroTargets.ts                 # NEW: MacroTargets GraphQL type
│   │   │       ├── Query.ts                        # MODIFY: Add getUserMacroTargets query
│   │   │       └── Mutation.ts                     # MODIFY: Add updateMacroTargets mutation
│   │   └── services/
│   │       └── macroTargetsService.ts              # NEW: Macro targets business logic
└── frontend/
    ├── components/
    │   └── food/
    │       ├── NutritionSummary.tsx                # MODIFY: Add edit icon, fetch targets from API
    │       └── EditMacroTargetsModal.tsx           # NEW: Modal for editing macro targets
    └── hooks/
        └── useMacroTargets.ts                      # NEW: Custom hook for macro targets
```

### Implementation Details

#### 1. Database Schema (Prisma)

```prisma
// backend/prisma/schema.prisma - ADD to existing schema

// User's customizable macro targets
model MacroTargets {
  id     String @id @default(cuid())
  userId String @unique @db.VarChar(255)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Daily nutrition targets
  calories Float  @db.DoublePrecision  // Daily calorie target
  protein  Float  @db.DoublePrecision  // Daily protein target (grams)
  carbs    Float  @db.DoublePrecision  // Daily carbs target (grams)
  fat      Float  @db.DoublePrecision  // Daily fat target (grams)

  // Timestamps
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @db.Timestamptz(6)

  @@map("macro_targets")
}

// MODIFY User model to add relation
model User {
  // ... existing fields
  macroTargets MacroTargets?
}
```

#### 2. Database Migration

```sql
-- Migration: Add macro_targets table
CREATE TABLE macro_targets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  calories DOUBLE PRECISION NOT NULL,
  protein DOUBLE PRECISION NOT NULL,
  carbs DOUBLE PRECISION NOT NULL,
  fat DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_macro_targets_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_macro_targets_user_id ON macro_targets(user_id);
```

#### 3. Backend GraphQL Schema

```typescript
// backend/src/schema/types/MacroTargets.ts - NEW FILE
import { builder } from '../builder';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../lib/auth';

// MacroTargets GraphQL type
export const MacroTargetsType = builder.objectRef<{
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
}>('MacroTargets').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    calories: t.exposeFloat('calories'),
    protein: t.exposeFloat('protein'),
    carbs: t.exposeFloat('carbs'),
    fat: t.exposeFloat('fat'),
    createdAt: t.string({
      resolve: (targets) => targets.createdAt.toISOString(),
    }),
    updatedAt: t.string({
      resolve: (targets) => targets.updatedAt.toISOString(),
    }),
  }),
});

// Input type for updating macro targets
const UpdateMacroTargetsInput = builder.inputType('UpdateMacroTargetsInput', {
  fields: (t) => ({
    calories: t.float({ required: true }),
    protein: t.float({ required: true }),
    carbs: t.float({ required: true }),
    fat: t.float({ required: true }),
  }),
});

// Query to get user's macro targets (with defaults if not set)
builder.queryField('getMacroTargets', (t) =>
  t.field({
    type: MacroTargetsType,
    nullable: false,
    resolve: async (_parent, _args, context) => {
      const userId = requireAuth(context);

      // Check if user has custom targets
      let targets = await prisma.macroTargets.findUnique({
        where: { userId },
      });

      // If no custom targets, return defaults
      if (!targets) {
        // Return default values without creating DB record
        return {
          id: 'default',
          userId,
          calories: 2600,
          protein: 170,
          carbs: 310,
          fat: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return targets;
    },
  })
);

// Mutation to update macro targets
builder.mutationField('updateMacroTargets', (t) =>
  t.field({
    type: MacroTargetsType,
    args: {
      input: t.arg({ type: UpdateMacroTargetsInput, required: true }),
    },
    resolve: async (_parent, args, context) => {
      const userId = requireAuth(context);

      // Validate input values are positive
      if (
        args.input.calories <= 0 ||
        args.input.protein <= 0 ||
        args.input.carbs <= 0 ||
        args.input.fat <= 0
      ) {
        throw new Error('All macro targets must be positive values');
      }

      // Upsert macro targets (create if not exists, update if exists)
      const targets = await prisma.macroTargets.upsert({
        where: { userId },
        create: {
          userId,
          calories: args.input.calories,
          protein: args.input.protein,
          carbs: args.input.carbs,
          fat: args.input.fat,
        },
        update: {
          calories: args.input.calories,
          protein: args.input.protein,
          carbs: args.input.carbs,
          fat: args.input.fat,
        },
      });

      return targets;
    },
  })
);
```

#### 4. Frontend Custom Hook

```typescript
// frontend/src/hooks/useMacroTargets.ts - NEW FILE
import { useQuery, useMutation } from 'urql';

const GET_MACRO_TARGETS_QUERY = `
  query GetMacroTargets {
    getMacroTargets {
      id
      calories
      protein
      carbs
      fat
    }
  }
`;

const UPDATE_MACRO_TARGETS_MUTATION = `
  mutation UpdateMacroTargets($input: UpdateMacroTargetsInput!) {
    updateMacroTargets(input: $input) {
      id
      calories
      protein
      carbs
      fat
    }
  }
`;

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function useMacroTargets() {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: GET_MACRO_TARGETS_QUERY,
    requestPolicy: 'cache-and-network',
  });

  const [, updateMutation] = useMutation(UPDATE_MACRO_TARGETS_MUTATION);

  const updateTargets = async (targets: MacroTargets) => {
    const result = await updateMutation({ input: targets });
    if (result.data?.updateMacroTargets) {
      refetch({ requestPolicy: 'network-only' });
    }
    return result;
  };

  return {
    targets: data?.getMacroTargets,
    loading: fetching,
    error,
    updateTargets,
    refetch,
  };
}
```

#### 5. Edit Macro Targets Modal Component

```typescript
// frontend/src/components/food/EditMacroTargetsModal.tsx - NEW FILE
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MacroTargetsSchema = z.object({
  calories: z.number().min(500).max(10000),
  protein: z.number().min(10).max(500),
  carbs: z.number().min(10).max(1000),
  fat: z.number().min(10).max(300),
});

type MacroTargetsFormData = z.infer<typeof MacroTargetsSchema>;

interface EditMacroTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onSave: (targets: MacroTargetsFormData) => Promise<void>;
}

export function EditMacroTargetsModal({
  isOpen,
  onClose,
  currentTargets,
  onSave,
}: EditMacroTargetsModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MacroTargetsFormData>({
    resolver: zodResolver(MacroTargetsSchema),
    defaultValues: currentTargets,
  });

  const onSubmit = async (data: MacroTargetsFormData) => {
    setIsSaving(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save macro targets:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Edit Daily Targets
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('calories', { valueAsNumber: true })}
              label="Calories"
              type="number"
              placeholder="2600"
              error={errors.calories?.message}
              min={500}
              max={10000}
            />

            <Input
              {...register('protein', { valueAsNumber: true })}
              label="Protein (g)"
              type="number"
              placeholder="170"
              error={errors.protein?.message}
              min={10}
              max={500}
            />

            <Input
              {...register('carbs', { valueAsNumber: true })}
              label="Carbs (g)"
              type="number"
              placeholder="310"
              error={errors.carbs?.message}
              min={10}
              max={1000}
            />

            <Input
              {...register('fat', { valueAsNumber: true })}
              label="Fat (g)"
              type="number"
              placeholder="75"
              error={errors.fat?.message}
              min={10}
              max={300}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Targets'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

#### 6. Updated NutritionSummary Component

```typescript
// frontend/src/components/food/NutritionSummary.tsx - MODIFY
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EditMacroTargetsModal } from './EditMacroTargetsModal';
import { useMacroTargets } from '@/hooks/useMacroTargets';

interface NutritionSummaryProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { targets, loading, updateTargets } = useMacroTargets();

  // Use loaded targets or fallback to defaults while loading
  const dailyTargets = targets || {
    calories: 2600,
    protein: 170,
    carbs: 310,
    fat: 75,
  };

  const caloriesGoalMet = nutrition.calories < dailyTargets.calories;
  const proteinGoalMet = nutrition.protein >= dailyTargets.protein;
  const fatGoalMet = nutrition.fat < dailyTargets.fat;

  const handleSaveTargets = async (newTargets: typeof dailyTargets) => {
    await updateTargets(newTargets);
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Daily Summary</h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Edit macro targets"
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Calories</p>
            <p className="text-2xl font-bold text-nutrition-calories">
              {Math.round(nutrition.calories)}
            </p>
            <p className={`text-xs ${caloriesGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
              / {dailyTargets.calories} goal
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Protein</p>
            <p className="text-2xl font-bold text-nutrition-protein">
              {Math.round(nutrition.protein)}g
            </p>
            <p className={`text-xs ${proteinGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
              / {dailyTargets.protein}g goal
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Carbs</p>
            <p className="text-2xl font-bold text-nutrition-carbs">
              {Math.round(nutrition.carbs)}g
            </p>
            <p className="text-xs text-gray-400">
              / {dailyTargets.carbs}g goal
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Fat</p>
            <p className="text-2xl font-bold text-nutrition-fat">
              {Math.round(nutrition.fat)}g
            </p>
            <p className={`text-xs ${fatGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
              / {dailyTargets.fat}g goal
            </p>
          </div>
        </div>
      </Card>

      <EditMacroTargetsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTargets={dailyTargets}
        onSave={handleSaveTargets}
      />
    </>
  );
}
```

## Acceptance Criteria

### Functional Requirements
- [x] **Display User Targets**: NutritionSummary shows user's custom macro targets (or defaults if not set)
- [x] **Edit Icon Visible**: Small edit icon appears in NutritionSummary header
- [x] **Modal Opens**: Clicking edit icon opens EditMacroTargetsModal
- [x] **Form Pre-filled**: Modal form is pre-filled with current targets
- [x] **Validation**: Form validates positive numbers within reasonable ranges
- [x] **Save Targets**: Saving updates targets in database and refreshes display
- [x] **Defaults Work**: New users see default targets (2600/170/310/75) without DB record
- [x] **Persistence**: Targets persist across sessions and page refreshes

### Technical Requirements
- [x] **Database Schema**: MacroTargets table with user relationship and cascade delete
- [x] **GraphQL API**: getMacroTargets query and updateMacroTargets mutation
- [x] **Type Safety**: Full TypeScript coverage for macro targets types
- [x] **Error Handling**: Graceful error handling for network failures and validation errors
- [x] **Loading States**: Loading indicator while fetching targets

### User Experience Requirements
- [x] **Subtle Icon**: Edit icon is subtle (gray) and non-intrusive
- [x] **Clear Labels**: Form inputs clearly labeled with units (g for macros)
- [x] **Immediate Feedback**: Updated targets reflect immediately after save
- [x] **Mobile Responsive**: Modal works well on mobile devices
- [x] **Cancel Option**: Users can cancel editing without changes

## Testing Strategy

### Unit Tests

**Backend Macro Targets Service Tests**
```typescript
// backend/src/__tests__/services/macroTargetsService.test.ts
describe('MacroTargets Service', () => {
  const user1Context = { userId: 'user1', isAuthenticated: true };

  it('should return default targets for new user', async () => {
    const targets = await getMacroTargets(user1Context);
    expect(targets.calories).toBe(2600);
    expect(targets.protein).toBe(170);
    expect(targets.carbs).toBe(310);
    expect(targets.fat).toBe(75);
  });

  it('should save custom targets', async () => {
    const customTargets = {
      calories: 2200,
      protein: 150,
      carbs: 250,
      fat: 70,
    };

    await updateMacroTargets(user1Context, customTargets);
    const saved = await getMacroTargets(user1Context);

    expect(saved.calories).toBe(2200);
    expect(saved.protein).toBe(150);
  });

  it('should reject negative values', async () => {
    await expect(
      updateMacroTargets(user1Context, {
        calories: -100,
        protein: 150,
        carbs: 250,
        fat: 70,
      })
    ).rejects.toThrow('All macro targets must be positive values');
  });

  it('should update existing targets', async () => {
    await updateMacroTargets(user1Context, {
      calories: 2200,
      protein: 150,
      carbs: 250,
      fat: 70,
    });

    await updateMacroTargets(user1Context, {
      calories: 2400,
      protein: 160,
      carbs: 270,
      fat: 75,
    });

    const targets = await getMacroTargets(user1Context);
    expect(targets.calories).toBe(2400);
  });
});
```

**Frontend Component Tests**
```typescript
// frontend/src/components/food/__tests__/EditMacroTargetsModal.test.tsx
describe('EditMacroTargetsModal', () => {
  const mockTargets = {
    calories: 2600,
    protein: 170,
    carbs: 310,
    fat: 75,
  };

  it('should render form with current values', () => {
    render(
      <EditMacroTargetsModal
        isOpen={true}
        onClose={jest.fn()}
        currentTargets={mockTargets}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('2600')).toBeInTheDocument();
    expect(screen.getByDisplayValue('170')).toBeInTheDocument();
  });

  it('should call onSave with updated values', async () => {
    const onSave = jest.fn();
    render(
      <EditMacroTargetsModal
        isOpen={true}
        onClose={jest.fn()}
        currentTargets={mockTargets}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '2200' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        calories: 2200,
        protein: 170,
        carbs: 310,
        fat: 75,
      });
    });
  });

  it('should show validation errors for invalid input', async () => {
    render(
      <EditMacroTargetsModal
        isOpen={true}
        onClose={jest.fn()}
        currentTargets={mockTargets}
        onSave={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '-100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

**GraphQL Macro Targets Flow Tests**
```typescript
// backend/src/__tests__/integration/macroTargets.test.ts
describe('MacroTargets GraphQL Integration', () => {
  let userToken: string;

  beforeAll(async () => {
    userToken = await generateTestJWT({ sub: 'testuser', email: 'test@example.com' });
  });

  it('should return default targets for new user', async () => {
    const query = `
      query {
        getMacroTargets {
          calories
          protein
          carbs
          fat
        }
      }
    `;

    const response = await graphqlRequest(query, {}, userToken);

    expect(response.data.getMacroTargets).toEqual({
      calories: 2600,
      protein: 170,
      carbs: 310,
      fat: 75,
    });
  });

  it('should update and retrieve custom targets', async () => {
    const mutation = `
      mutation UpdateTargets($input: UpdateMacroTargetsInput!) {
        updateMacroTargets(input: $input) {
          calories
          protein
          carbs
          fat
        }
      }
    `;

    const updateResponse = await graphqlRequest(
      mutation,
      {
        input: {
          calories: 2200,
          protein: 150,
          carbs: 250,
          fat: 70,
        },
      },
      userToken
    );

    expect(updateResponse.data.updateMacroTargets.calories).toBe(2200);

    // Verify retrieval
    const query = `query { getMacroTargets { calories protein carbs fat } }`;
    const getResponse = await graphqlRequest(query, {}, userToken);

    expect(getResponse.data.getMacroTargets.calories).toBe(2200);
  });

  it('should require authentication', async () => {
    const query = `query { getMacroTargets { calories } }`;
    const response = await graphqlRequest(query); // No token

    expect(response.errors).toBeDefined();
    expect(response.errors[0].message).toContain('Authentication required');
  });
});
```

### Manual Verification Checklist

**Functional Verification**
1. [ ] Log in as a user and navigate to home page
2. [ ] Verify NutritionSummary shows default targets (2600/170/310/75)
3. [ ] Click edit icon to open modal
4. [ ] Change calories to 2200, protein to 150
5. [ ] Click Save and verify modal closes
6. [ ] Verify NutritionSummary immediately shows new targets
7. [ ] Refresh page and verify targets persist
8. [ ] Try entering negative values and verify validation error
9. [ ] Try entering very large values (>10000 cal) and verify validation
10. [ ] Click Cancel and verify changes are discarded

**Visual Verification**
- [ ] Edit icon is subtle (gray) and appropriately sized
- [ ] Modal centers on screen on desktop
- [ ] Modal fits properly on mobile viewport
- [ ] Form inputs are clearly labeled with units
- [ ] Save/Cancel buttons are clearly distinguishable
- [ ] Loading state shows during save operation
- [ ] Success feedback is clear (modal closes, data updates)

**Edge Case Verification**
- [ ] New user with no custom targets sees defaults
- [ ] Editing targets multiple times works correctly
- [ ] Network error during save shows error message
- [ ] Clicking outside modal does not close it (intentional)
- [ ] Form validation prevents submission of invalid data

**Performance Verification**
- [ ] Modal opens instantly (<100ms)
- [ ] Save operation completes within 1 second
- [ ] No console errors or warnings
- [ ] Targets query completes quickly (<200ms)

## Implementation Notes

### Development Approach

**Phase 1: Database & Backend (Day 1)**
1. Add MacroTargets model to Prisma schema
2. Create and apply database migration
3. Implement GraphQL queries and mutations
4. Write unit tests for macro targets service
5. Test with GraphiQL/Apollo Sandbox

**Phase 2: Frontend Components (Day 1-2)**
1. Create useMacroTargets custom hook
2. Build EditMacroTargetsModal component
3. Update NutritionSummary with edit icon
4. Write component unit tests
5. Test modal functionality manually

**Phase 3: Integration & Testing (Day 2)**
1. Write integration tests for GraphQL flow
2. Manual testing across browsers/devices
3. Fix bugs and edge cases
4. Update documentation
5. Deploy and verify in production

### Default Values Rationale
- **Calories: 2600** - Moderate male maintenance calories
- **Protein: 170g** - 1g per lb for 170lb person (common fitness goal)
- **Carbs: 310g** - ~45% of calories from carbs
- **Fat: 75g** - ~25% of calories from fat

### Validation Ranges
- **Calories**: 500-10000 (covers weight loss to extreme bulking)
- **Protein**: 10-500g (covers all reasonable scenarios)
- **Carbs**: 10-1000g (low-carb to high-carb diets)
- **Fat**: 10-300g (low-fat to ketogenic diets)

### Future Enhancements (Out of Scope)
- Calculate targets based on user profile (age, weight, height, activity level)
- Macro ratio presets (e.g., "Cutting", "Bulking", "Keto")
- Weekly or monthly target averages
- Historical target changes tracking

## Definition of Done

### Code Complete
- [ ] MacroTargets Prisma model added and migration created
- [ ] GraphQL queries and mutations implemented
- [ ] useMacroTargets custom hook created
- [ ] EditMacroTargetsModal component built
- [ ] NutritionSummary updated with edit icon
- [ ] Unit tests passing (80%+ coverage for new code)
- [ ] Integration tests passing
- [ ] TypeScript compilation successful with no errors
- [ ] ESLint passing with no errors

### Testing Complete
- [ ] Unit tests for backend service (6+ tests)
- [ ] Unit tests for frontend components (6+ tests)
- [ ] Integration tests for GraphQL flow (4+ tests)
- [ ] Manual testing checklist completed
- [ ] Tested on mobile and desktop browsers
- [ ] Edge cases verified and handled

### Documentation Complete
- [ ] GraphQL schema documented with descriptions
- [ ] Component props documented with JSDoc
- [ ] API changes noted in schema
- [ ] Default values and validation ranges documented

---

**Ready for Implementation**: This task provides comprehensive specifications for adding customizable macro targets with an edit icon on the NutritionSummary component, database persistence, and sensible default values.
