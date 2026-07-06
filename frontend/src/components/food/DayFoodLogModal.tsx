'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'urql';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FoodLogItem } from './FoodLogItem';
import { EditFoodModal } from './EditFoodModal';

const FOODS_BY_DATE_QUERY = `
  query FoodsByDate($date: String!) {
    foodsByDate(date: $date) {
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
  mutation DeleteFoodFromDay($id: String!) {
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

interface DayFoodLogModalProps {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  onClose: () => void;
}

function formatTitle(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year!, month! - 1, day!).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function calculateTotals(foods: Food[]) {
  return foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories ?? 0),
      protein: acc.protein + (f.protein ?? 0),
      carbs: acc.carbs + (f.carbs ?? 0),
      fat: acc.fat + (f.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function DayFoodLogModal({ date, isOpen, onClose }: DayFoodLogModalProps) {
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: FOODS_BY_DATE_QUERY,
    variables: { date },
    requestPolicy: 'cache-and-network',
    pause: !isOpen,
  });

  const [, deleteMutation] = useMutation(DELETE_FOOD_MUTATION);

  const foods: Food[] = (data?.foodsByDate ?? []).slice().reverse();
  const totals = calculateTotals(foods);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this food entry?')) return;
    const result = await deleteMutation({ id });
    if (result.error) {
      toast.error('Failed to delete food entry.');
    } else {
      toast.success('Food entry deleted.');
      reexecuteQuery({ requestPolicy: 'network-only' });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={formatTitle(date)}>
        <div className="space-y-4">
          {fetching && !data ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <p className="text-center text-red-600 py-8">Failed to load food log.</p>
          ) : foods.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No food entries logged for this day.</p>
          ) : (
            <>
              {/* Totals bar */}
              <div className="flex gap-4 text-sm px-1">
                <span className="text-nutrition-calories font-medium">
                  {Math.round(totals.calories).toLocaleString()} cal
                </span>
                <span className="text-nutrition-protein">{Math.round(totals.protein)}g P</span>
                <span className="text-nutrition-carbs">{Math.round(totals.carbs)}g C</span>
                <span className="text-nutrition-fat">{Math.round(totals.fat)}g F</span>
                <span className="text-gray-400 ml-auto">{foods.length} {foods.length === 1 ? 'item' : 'items'}</span>
              </div>

              {/* Food list */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {foods.map((food) => (
                  <FoodLogItem
                    key={food.id}
                    food={food}
                    onEdit={() => setEditingFood(food)}
                    onDelete={() => handleDelete(food.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          isOpen={true}
          onClose={() => setEditingFood(null)}
          onSuccess={() => {
            setEditingFood(null);
            toast.success('Food entry updated.');
            reexecuteQuery({ requestPolicy: 'network-only' });
          }}
        />
      )}
    </>
  );
}
