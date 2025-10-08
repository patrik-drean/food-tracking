'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import { FoodEntrySchema, type FoodEntryFormData } from './FoodFormSchema';
import { useMutation } from 'urql';

const UPDATE_FOOD_MUTATION = `
  mutation UpdateFoodNutrition($input: UpdateFoodNutritionInput!) {
    updateFoodNutrition(input: $input) {
      id
      description
      calories
      protein
      carbs
      fat
      isManual
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
}

interface EditFoodModalProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for editing food nutrition values
 */
export function EditFoodModal({
  food,
  isOpen,
  onClose,
  onSuccess,
}: EditFoodModalProps) {
  const [updateResult, updateMutation] = useMutation(UPDATE_FOOD_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Pick<FoodEntryFormData, 'nutrition'>>({
    resolver: zodResolver(FoodEntrySchema.pick({ nutrition: true })),
    defaultValues: {
      nutrition: {
        calories: food.calories ?? undefined,
        fat: food.fat ?? undefined,
        carbohydrates: food.carbs ?? undefined,
        protein: food.protein ?? undefined,
      },
    },
  });

  const onSubmit = async (data: Pick<FoodEntryFormData, 'nutrition'>) => {
    if (!data.nutrition) return;

    try {
      const result = await updateMutation({
        input: {
          id: food.id,
          nutrition: {
            calories: data.nutrition.calories ?? null,
            protein: data.nutrition.protein ?? null,
            carbs: data.nutrition.carbohydrates ?? null,
            fat: data.nutrition.fat ?? null,
          },
        },
      });

      if (result.data?.updateFoodNutrition) {
        onSuccess();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
            {...register('nutrition.carbohydrates', { valueAsNumber: true })}
            label="Carbs"
            placeholder="0"
            error={errors.nutrition?.carbohydrates?.message}
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
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
