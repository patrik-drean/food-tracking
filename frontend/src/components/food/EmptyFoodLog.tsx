import { Card } from '@/components/ui/Card';

/**
 * Empty state for food log when no items exist
 */
export function EmptyFoodLog() {
  return (
    <Card>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No foods logged today
        </h3>
        <p className="text-gray-600">
          Start by adding your first meal or snack above
        </p>
      </div>
    </Card>
  );
}
