'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NutritionInputs } from './NutritionInputs';
import { FoodEntrySchema, type FoodEntryFormData } from './FoodFormSchema';
import { useMutation } from 'urql';

// GraphQL mutation for adding food
const ADD_FOOD_MUTATION = `
  mutation AddFood($input: AddFoodInput!) {
    addFood(input: $input) {
      id
      description
      calories
      protein
      carbohydrates
      fat
      createdAt
    }
  }
`;

interface FoodEntryFormProps {
  onSuccess?: () => void;
}

/**
 * Main food entry form component with inline expandable nutrition inputs
 * Implements Option 1: Clean default state with progressive disclosure
 */
export function FoodEntryForm({ onSuccess }: FoodEntryFormProps) {
  const [showNutritionInputs, setShowNutritionInputs] = useState(false);
  const [addFoodResult, addFoodMutation] = useMutation(ADD_FOOD_MUTATION);

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
        protein: undefined,
        carbohydrates: undefined,
        fat: undefined,
      },
    },
  });

  const onSubmit = async (data: FoodEntryFormData) => {
    try {
      const nutritionData = data.nutrition;
      const hasNutrition = nutritionData &&
        Object.values(nutritionData).some(v => v !== undefined && v !== null && !isNaN(v as number));

      const result = await addFoodMutation({
        input: {
          description: data.description,
          calories: hasNutrition ? nutritionData?.calories : null,
          protein: hasNutrition ? nutritionData?.protein : null,
          carbohydrates: hasNutrition ? nutritionData?.carbohydrates : null,
          fat: hasNutrition ? nutritionData?.fat : null,
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

  const nutritionData = watch('nutrition');
  const hasNutritionData = nutritionData &&
    Object.values(nutritionData).some(v => v !== undefined && v !== null && !isNaN(v as number));

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Food Entry
          </h3>
        </div>

        <Input
          {...register('description')}
          label="Food Description"
          placeholder="2 eggs with toast, 1 medium apple"
          error={errors.description?.message}
        />

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setShowNutritionInputs(!showNutritionInputs)}
            className="w-full justify-between"
          >
            <span>
              {showNutritionInputs ? '− Hide' : '+ Add'} Nutrition Information
            </span>
            {hasNutritionData && (
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Failed to save food entry. Please try again.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
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
