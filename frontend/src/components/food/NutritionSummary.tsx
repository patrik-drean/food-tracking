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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm text-gray-500">Calories</p>
            <p className={`text-sm ${caloriesGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
              {Math.round(nutrition.calories)} / {dailyTargets.calories}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300 bg-nutrition-calories"
              style={{ width: `${Math.min((nutrition.calories / dailyTargets.calories) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm text-gray-500">Protein</p>
            <p className={`text-sm ${proteinGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
              {Math.round(nutrition.protein)}g / {dailyTargets.protein}g
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300 bg-nutrition-protein"
              style={{ width: `${Math.min((nutrition.protein / dailyTargets.protein) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm text-gray-500">Carbs</p>
            <p className="text-sm text-gray-400">
              {Math.round(nutrition.carbs)}g / {dailyTargets.carbs}g
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300 bg-nutrition-carbs"
              style={{ width: `${Math.min((nutrition.carbs / dailyTargets.carbs) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm text-gray-500">Fat</p>
            <p className={`text-sm ${fatGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
              {Math.round(nutrition.fat)}g / {dailyTargets.fat}g
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300 bg-nutrition-fat"
              style={{ width: `${Math.min((nutrition.fat / dailyTargets.fat) * 100, 100)}%` }}
            />
          </div>
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
