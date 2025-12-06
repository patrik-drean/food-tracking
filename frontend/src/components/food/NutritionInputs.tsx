import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { NumberInput } from '@/components/ui/NumberInput';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FoodEntryFormData } from './FoodFormSchema';

interface NutritionInputsProps {
  register: UseFormRegister<FoodEntryFormData>;
  errors?: FieldErrors<NonNullable<FoodEntryFormData['nutrition']>> | undefined;
  setValue: UseFormSetValue<FoodEntryFormData>;
  watch: UseFormWatch<FoodEntryFormData>;
  aiSource?: 'AI_GENERATED' | 'CACHED' | null;
}

/**
 * Collapsible nutrition inputs component with AI badge support
 * Shows calories, protein, carbs, fat in a 2x2 grid
 */
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
    setValue('nutrition.protein', undefined);
    setValue('nutrition.carbohydrates', undefined);
    setValue('nutrition.fat', undefined);
  };

  const hasAnyValue = nutritionData &&
    Object.values(nutritionData).some(v => v !== undefined && v !== null && !isNaN(v as number));

  return (
    <Card padding="sm" className="bg-gray-50 border-dashed border-2 animate-in slide-in-from-top-2 duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-700">
              Nutrition Information
            </h4>
            {aiSource && (
              <Badge variant={aiSource === 'CACHED' ? 'secondary' : 'primary'} size="sm">
                {aiSource === 'CACHED' ? '⚡ Cached' : '✨ AI Generated'}
              </Badge>
            )}
          </div>
          {hasAnyValue && (
            <button
              type="button"
              onClick={clearAllNutrition}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
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
            {...register('nutrition.carbohydrates', { valueAsNumber: true })}
            label="Carbs"
            placeholder="0"
            error={errors?.carbohydrates?.message}
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

      </div>
    </Card>
  );
}
