'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'urql';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FoodLogItem } from './FoodLogItem';
import { NutritionSummary } from './NutritionSummary';
import { EmptyFoodLog } from './EmptyFoodLog';
import { EditFoodModal } from './EditFoodModal';

const TODAYS_FOODS_QUERY = `
  query TodaysFoods {
    todaysFoods {
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

const DELETE_FOOD_MUTATION = `
  mutation DeleteFood($id: String!) {
    deleteFood(id: $id) {
      id
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
  isManual: boolean;
  createdAt: string;
}

interface DailyFoodLogProps {
  // eslint-disable-next-line no-unused-vars
  onRefetchReady?: (refetch: () => void) => void;
}

/**
 * Main daily food log component with real-time updates
 */
export function DailyFoodLog({ onRefetchReady }: DailyFoodLogProps) {
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: TODAYS_FOODS_QUERY,
    requestPolicy: 'cache-and-network',
  });
  const [, deleteMutation] = useMutation(DELETE_FOOD_MUTATION);

  // Expose refetch function to parent component
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(() => {
        reexecuteQuery({ requestPolicy: 'network-only' });
      });
    }
  }, [onRefetchReady, reexecuteQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food entry?')) return;

    try {
      await deleteMutation({ id });
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  if (fetching && !data) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading today's foods...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load food log</p>
          <Button onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const foods: Food[] = (data?.todaysFoods || []).slice().reverse();
  const totalNutrition = calculateTotalNutrition(foods);

  if (foods.length === 0) {
    return <EmptyFoodLog />;
  }

  return (
    <>
      <div className="space-y-4">
        <NutritionSummary nutrition={totalNutrition} />

        <Card>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Food Log ({foods.length} {foods.length === 1 ? 'item' : 'items'})
            </h3>

            <div className="space-y-2">
              {foods.map((food) => (
                <FoodLogItem
                  key={food.id}
                  food={food}
                  onEdit={() => setEditingFood(food)}
                  onDelete={() => handleDelete(food.id)}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          isOpen={true}
          onClose={() => setEditingFood(null)}
          onSuccess={() => {
            setEditingFood(null);
            reexecuteQuery({ requestPolicy: 'network-only' });
          }}
        />
      )}
    </>
  );
}

function calculateTotalNutrition(foods: Food[]) {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + (food.calories || 0),
      protein: total.protein + (food.protein || 0),
      carbs: total.carbs + (food.carbs || 0),
      fat: total.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
