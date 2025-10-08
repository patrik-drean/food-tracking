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
          <p className="text-xs text-gray-400">/ {dailyTargets.carbs}g goal</p>
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
