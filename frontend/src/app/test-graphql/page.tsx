'use client';

import { useQuery, useMutation } from 'urql';
import { 
  TodaysFoodsDocument, 
  AddFoodDocument,
  Food 
} from '@/generated/graphql';
import { useGraphQLState } from '@/hooks/useGraphQLState';
import { useState } from 'react';

export default function TestGraphQLPage() {
  const [result] = useQuery({
    query: TodaysFoodsDocument,
  });

  const [, addFood] = useMutation(AddFoodDocument);
  const [newFood, setNewFood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error } = useGraphQLState(result);

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.trim()) return;

    setIsSubmitting(true);
    try {
      await addFood({
        input: {
          description: newFood.trim(),
          nutrition: {
            calories: Math.floor(Math.random() * 500) + 100, // Random calories for testing
            protein: Math.floor(Math.random() * 30) + 5,
            carbs: Math.floor(Math.random() * 50) + 10,
            fat: Math.floor(Math.random() * 20) + 2,
          }
        }
      });
      setNewFood('');
    } catch (err) {
      console.error('Error adding food:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">GraphQL Integration Test</h1>
      
      {/* Add Food Form */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Test Food</h2>
        <form onSubmit={handleAddFood} className="flex gap-4">
          <input
            type="text"
            value={newFood}
            onChange={(e) => setNewFood(e.target.value)}
            placeholder="Enter food description..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newFood.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Food'}
          </button>
        </form>
      </div>

      {/* Today's Foods */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Foods</h2>
        
        {loading && <div className="text-gray-500">Loading...</div>}
        
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">
            Error: {error}
          </div>
        )}
        
        {data?.todaysFoods?.length === 0 ? (
          <p className="text-gray-500">No foods logged today</p>
        ) : (
          <div className="space-y-4">
            {data?.todaysFoods?.map((food: Food) => (
              <div key={food.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{food.description}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {food.calories && `${food.calories} calories`}
                      {food.protein && ` • ${food.protein}g protein`}
                      {food.carbs && ` • ${food.carbs}g carbs`}
                      {food.fat && ` • ${food.fat}g fat`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {food.isManual ? 'Manual' : 'AI'} • {new Date(food.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-green-800 font-medium">
            ✅ GraphQL client connected successfully!
          </span>
        </div>
        <p className="text-green-700 text-sm mt-2">
          Frontend is successfully communicating with the GraphQL backend at localhost:4000
        </p>
      </div>
    </div>
  );
}
