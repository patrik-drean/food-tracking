'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import { useMutation } from 'urql';
import toast from 'react-hot-toast';

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
      createdAt
    }
  }
`;

const EditFoodSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  calories: z.number().min(0).max(10000).optional().or(z.literal(NaN).transform(() => undefined)),
  protein: z.number().min(0).max(1000).optional().or(z.literal(NaN).transform(() => undefined)),
  carbohydrates: z.number().min(0).max(1000).optional().or(z.literal(NaN).transform(() => undefined)),
  fat: z.number().min(0).max(1000).optional().or(z.literal(NaN).transform(() => undefined)),
});

type EditFoodFormData = z.infer<typeof EditFoodSchema>;

interface Food {
  id: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  createdAt: string;
}

interface EditFoodModalProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function toLocalDateString(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayDateString(): string {
  return toLocalDateString(new Date().toISOString());
}

export function EditFoodModal({ food, isOpen, onClose, onSuccess }: EditFoodModalProps) {
  const [updateResult, updateMutation] = useMutation(UPDATE_FOOD_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFoodFormData>({
    resolver: zodResolver(EditFoodSchema),
    defaultValues: {
      date: toLocalDateString(food.createdAt),
      calories: food.calories ?? undefined,
      protein: food.protein ?? undefined,
      carbohydrates: food.carbs ?? undefined,
      fat: food.fat ?? undefined,
    },
  });

  const onSubmit = async (data: EditFoodFormData) => {
    const originalDate = toLocalDateString(food.createdAt);
    const dateChanged = data.date !== originalDate;

    try {
      const result = await updateMutation({
        input: {
          id: food.id,
          nutrition: {
            calories: data.calories ?? null,
            protein: data.protein ?? null,
            carbs: data.carbohydrates ?? null,
            fat: data.fat ?? null,
          },
          ...(dateChanged ? { date: data.date } : {}),
        },
      });

      if (result.error) {
        toast.error('Failed to update food entry. Please try again.');
      } else if (result.data?.updateFoodNutrition) {
        onSuccess();
      }
    } catch {
      toast.error('Failed to update food entry. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Nutrition">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600">
          <strong>{food.description}</strong>
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            max={todayDateString()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register('date')}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            {...register('calories', { valueAsNumber: true })}
            label="Calories"
            placeholder="0"
            error={errors.calories?.message}
            suffix="cal"
          />

          <NumberInput
            {...register('protein', { valueAsNumber: true })}
            label="Protein"
            placeholder="0"
            error={errors.protein?.message}
            suffix="g"
          />

          <NumberInput
            {...register('carbohydrates', { valueAsNumber: true })}
            label="Carbs"
            placeholder="0"
            error={errors.carbohydrates?.message}
            suffix="g"
          />

          <NumberInput
            {...register('fat', { valueAsNumber: true })}
            label="Fat"
            placeholder="0"
            error={errors.fat?.message}
            suffix="g"
          />
        </div>

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
