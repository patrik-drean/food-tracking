'use client';

import { useQuery } from 'urql';
import { TodaysFoodsDocument, Food } from '@/generated/graphql';
import { useGraphQLState } from '@/hooks/useGraphQLState';

export function GraphQLTest() {
  const [result] = useQuery({
    query: TodaysFoodsDocument,
  });

  const { data, loading, error } = useGraphQLState(result);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Today's Foods (GraphQL Test)</h2>
      {data?.todaysFoods?.length === 0 ? (
        <p className="text-gray-500">No foods logged today</p>
      ) : (
        <ul className="space-y-2">
          {data?.todaysFoods?.map((food: Food) => (
            <li key={food.id} className="border rounded p-3">
              <div className="font-medium">{food.description}</div>
              {food.calories && (
                <div className="text-sm text-gray-600">
                  {food.calories} calories
                  {food.protein && ` • ${food.protein}g protein`}
                  {food.carbs && ` • ${food.carbs}g carbs`}
                  {food.fat && ` • ${food.fat}g fat`}
                </div>
              )}
              <div className="text-xs text-gray-400">
                {food.isManual ? 'Manual entry' : 'AI generated'} • {food.createdAt}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
