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
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

/**
 * Get color coding based on percentage of goal
 * Green: 70-100%, Amber: 100-120%, Red: >120%
 */
function getColorClass(value: number, target: number): string {
  const percentage = (value / target) * 100;

  if (percentage >= 120) return 'text-red-600';
  if (percentage >= 100) return 'text-amber-600';
  if (percentage >= 70) return 'text-green-600';
  return 'text-gray-900';
}

export function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const caloriesColor = getColorClass(nutrition.calories, DAILY_TARGETS.calories);
  const proteinColor = getColorClass(nutrition.protein, DAILY_TARGETS.protein);
  const carbsColor = getColorClass(nutrition.carbs, DAILY_TARGETS.carbs);
  const fatColor = getColorClass(nutrition.fat, DAILY_TARGETS.fat);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Daily Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Calories</p>
          <p className={`text-2xl font-bold ${caloriesColor}`}>
            {Math.round(nutrition.calories)}
          </p>
          <p className="text-xs text-gray-400">/ {DAILY_TARGETS.calories} goal</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Protein</p>
          <p className={`text-2xl font-bold ${proteinColor}`}>
            {Math.round(nutrition.protein)}g
          </p>
          <p className="text-xs text-gray-400">/ {DAILY_TARGETS.protein}g goal</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Carbs</p>
          <p className={`text-2xl font-bold ${carbsColor}`}>
            {Math.round(nutrition.carbs)}g
          </p>
          <p className="text-xs text-gray-400">/ {DAILY_TARGETS.carbs}g goal</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Fat</p>
          <p className={`text-2xl font-bold ${fatColor}`}>
            {Math.round(nutrition.fat)}g
          </p>
          <p className="text-xs text-gray-400">/ {DAILY_TARGETS.fat}g goal</p>
        </div>
      </div>
    </Card>
  );
}
