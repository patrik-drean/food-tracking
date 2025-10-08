'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MacroTargetsSchema = z.object({
  calories: z.number().min(500, 'Calories must be at least 500').max(10000, 'Calories must be at most 10000'),
  protein: z.number().min(10, 'Protein must be at least 10g').max(500, 'Protein must be at most 500g'),
  carbs: z.number().min(10, 'Carbs must be at least 10g').max(1000, 'Carbs must be at most 1000g'),
  fat: z.number().min(10, 'Fat must be at least 10g').max(300, 'Fat must be at most 300g'),
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
  // eslint-disable-next-line no-unused-vars
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
      // eslint-disable-next-line no-console
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
