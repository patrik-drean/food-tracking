import { Card } from '@/components/ui/Card';

export function LoadingNutritionState() {
  return (
    <Card padding="sm" className="bg-gray-50 border-dashed border-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="h-3 w-4 bg-primary-300 rounded-full animate-pulse" />
          <span>Analyzing with AI...</span>
        </div>
      </div>
    </Card>
  );
}
