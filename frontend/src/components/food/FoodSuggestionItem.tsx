interface Food {
  id: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isManual: boolean;
}

interface FoodSuggestionItemProps {
  food: Food;
  onClick: () => void;
}

/**
 * Individual suggestion item in the food typeahead dropdown
 * Shows food description, nutrition preview, and manual entry badge
 */
export function FoodSuggestionItem({ food, onClick }: FoodSuggestionItemProps) {
  const hasNutrition = food.calories || food.protein || food.carbs || food.fat;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {food.description}
          </p>
          {hasNutrition ? (
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
              {food.calories && (
                <span>{Math.round(food.calories)} cal</span>
              )}
              {food.protein && (
                <span className="text-food-protein">{food.protein}g P</span>
              )}
              {food.carbs && (
                <span className="text-food-carbs">{food.carbs}g C</span>
              )}
              {food.fat && (
                <span className="text-food-fat">{food.fat}g F</span>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">No nutrition data</p>
          )}
        </div>
      </button>
    </li>
  );
}
