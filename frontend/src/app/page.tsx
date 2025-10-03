'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { FoodEntryForm } from '@/components/food/FoodEntryForm';
import { DailyFoodLog } from '@/components/food/DailyFoodLog';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Today's Food Log
          </h2>
          <p className="text-gray-600">
            Track your daily nutrition and stay on top of your goals
          </p>
        </div>

        <FoodEntryForm onSuccess={() => {
          // Food list will auto-refresh via Urql cache
        }} />

        <DailyFoodLog />
      </div>
    </AppLayout>
  );
}