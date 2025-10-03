import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Nutrition Summary Card */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Calories</p>
              <p className="text-2xl font-bold text-nutrition-calories">0</p>
              <p className="text-xs text-gray-400">/ 2000 goal</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Protein</p>
              <p className="text-2xl font-bold text-nutrition-protein">0g</p>
              <p className="text-xs text-gray-400">/ 150g goal</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Carbs</p>
              <p className="text-2xl font-bold text-nutrition-carbs">0g</p>
              <p className="text-xs text-gray-400">/ 250g goal</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Fat</p>
              <p className="text-2xl font-bold text-nutrition-fat">0g</p>
              <p className="text-xs text-gray-400">/ 65g goal</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button className="flex-1">
            Add Food Entry
          </Button>
          <Button variant="outline">
            View History
          </Button>
        </div>

        {/* Food Log */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Food Entries
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No food entries yet today</p>
            <p className="text-sm">Add your first meal to get started</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}