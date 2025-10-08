'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FoodEntryForm } from '@/components/food/FoodEntryForm';
import { DailyFoodLog } from '@/components/food/DailyFoodLog';

export default function HomePage() {
  const [refetchFoodLog, setRefetchFoodLog] = useState<(() => void) | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <FoodEntryForm onSuccess={() => {
          // Refetch the food log to show the newly added entry
          refetchFoodLog?.();
        }} />

        <DailyFoodLog onRefetchReady={(refetch) => {
          setRefetchFoodLog(() => refetch);
        }} />
      </div>
    </AppLayout>
  );
}