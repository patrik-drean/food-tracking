import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Food {
  id: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isManual: boolean;
}

interface FoodLogItemProps {
  food: Food;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Compact food log item with nutrition data and actions
 */
export function FoodLogItem({ food, onEdit, onDelete }: FoodLogItemProps) {
  const hasNutrition = food.calories || food.protein || food.carbs || food.fat;

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {food.description}
          </p>
          {food.isManual && (
            <Badge variant="secondary" size="sm">
              Manual
            </Badge>
          )}
        </div>

        {hasNutrition ? (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {food.calories !== null && (
              <span className="text-nutrition-calories">
                {Math.round(food.calories)} cal
              </span>
            )}
            {food.protein !== null && (
              <span className="text-nutrition-protein">
                {Math.round(food.protein)}g P
              </span>
            )}
            {food.carbs !== null && (
              <span className="text-nutrition-carbs">
                {Math.round(food.carbs)}g C
              </span>
            )}
            {food.fat !== null && (
              <span className="text-nutrition-fat">
                {Math.round(food.fat)}g F
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No nutrition data</p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
