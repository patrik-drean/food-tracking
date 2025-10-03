'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { FoodEntryForm } from '@/components/food/FoodEntryForm';
import { DailyFoodLog } from '@/components/food/DailyFoodLog';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <FoodEntryForm onSuccess={() => {
          // Food list will auto-refresh via Urql cache
        }} />

        <DailyFoodLog />
      </div>
    </AppLayout>
  );
}