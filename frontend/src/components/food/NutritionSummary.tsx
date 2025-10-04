import { Card } from '@/components/ui/Card';

interface NutritionSummaryProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const DAILY_TARGETS = {
  calories: 2600,
  protein: 170,
  carbs: 310,
  fat: 75,
};

export function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const caloriesGoalMet = nutrition.calories < DAILY_TARGETS.calories;
  const proteinGoalMet = nutrition.protein >= DAILY_TARGETS.protein;
  const fatGoalMet = nutrition.fat < DAILY_TARGETS.fat;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Daily Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Calories</p>
          <p className="text-2xl font-bold text-nutrition-calories">
            {Math.round(nutrition.calories)}
          </p>
          <p className={`text-xs ${caloriesGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
            / {DAILY_TARGETS.calories} goal
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Protein</p>
          <p className="text-2xl font-bold text-nutrition-protein">
            {Math.round(nutrition.protein)}g
          </p>
          <p className={`text-xs ${proteinGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
            / {DAILY_TARGETS.protein}g goal
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Carbs</p>
          <p className="text-2xl font-bold text-nutrition-carbs">
            {Math.round(nutrition.carbs)}g
          </p>
          <p className="text-xs text-gray-400">/ {DAILY_TARGETS.carbs}g goal</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Fat</p>
          <p className="text-2xl font-bold text-nutrition-fat">
            {Math.round(nutrition.fat)}g
          </p>
          <p className={`text-xs ${fatGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
            / {DAILY_TARGETS.fat}g goal
          </p>
        </div>
      </div>
    </Card>
  );
}
