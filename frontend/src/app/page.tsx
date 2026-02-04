'use client';

import { useRef, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FoodEntryForm } from '@/components/food/FoodEntryForm';
import { DailyFoodLog } from '@/components/food/DailyFoodLog';

export default function HomePage() {
  const refetchFoodLogRef = useRef<(() => void) | null>(null);

  const handleRefetchReady = useCallback((refetch: () => void) => {
    refetchFoodLogRef.current = refetch;
  }, []);

  const handleFoodAdded = useCallback(() => {
    refetchFoodLogRef.current?.();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <FoodEntryForm onSuccess={handleFoodAdded} />
        <DailyFoodLog onRefetchReady={handleRefetchReady} />
      </div>
    </AppLayout>
  );
}