'use client';

import { useState } from 'react';
import { useQuery } from 'urql';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const WEEKLY_SUMMARY_QUERY = `
  query WeeklySummary {
    weeklySummary {
      date
      calories
      protein
      carbs
      fat
    }
  }
`;

interface DailySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${dayName} ${Number(month)}/${Number(day)}`;
}

function computeAverages(summaries: DailySummary[]) {
  const count = summaries.length || 1;
  const totals = summaries.reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: Math.round(totals.calories / count),
    protein: Math.round(totals.protein / count),
    carbs: Math.round(totals.carbs / count),
    fat: Math.round(totals.fat / count),
  };
}

export function WeeklyNutritionSummary() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [{ data, fetching, error }] = useQuery({
    query: WEEKLY_SUMMARY_QUERY,
    requestPolicy: 'cache-and-network',
    pause: !isExpanded,
  });

  const summaries: DailySummary[] = data?.weeklySummary || [];
  const avg = summaries.length > 0 ? computeAverages(summaries) : null;

  return (
    <Card padding="none">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">7-Day Summary</h3>
          {!isExpanded && avg && (
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-nutrition-calories">{avg.calories.toLocaleString()} cal</span>
              {' · '}
              <span className="text-nutrition-protein">{avg.protein}g P</span>
              {' · '}
              <span className="text-nutrition-carbs">{avg.carbs}g C</span>
              {' · '}
              <span className="text-nutrition-fat">{avg.fat}g F</span>
              <span className="text-gray-400"> avg</span>
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          {fetching && !data ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-6">Failed to load weekly summary</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Date</th>
                      <th className="text-right py-2 px-2 font-medium text-nutrition-calories">Calories</th>
                      <th className="text-right py-2 px-2 font-medium text-nutrition-protein">Protein</th>
                      <th className="text-right py-2 px-2 font-medium text-nutrition-carbs">Carbs</th>
                      <th className="text-right py-2 px-2 font-medium text-nutrition-fat">Fat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((day) => (
                      <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 pr-4 text-gray-700">{formatDate(day.date)}</td>
                        <td className="py-2 px-2 text-right text-gray-900">
                          {Math.round(day.calories).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-900">{Math.round(day.protein)}g</td>
                        <td className="py-2 px-2 text-right text-gray-900">{Math.round(day.carbs)}g</td>
                        <td className="py-2 px-2 text-right text-gray-900">{Math.round(day.fat)}g</td>
                      </tr>
                    ))}
                  </tbody>
                  {avg && (
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-semibold">
                        <td className="py-2 pr-4 text-gray-700">7-Day Avg</td>
                        <td className="py-2 px-2 text-right text-nutrition-calories">
                          {avg.calories.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right text-nutrition-protein">{avg.protein}g</td>
                        <td className="py-2 px-2 text-right text-nutrition-carbs">{avg.carbs}g</td>
                        <td className="py-2 px-2 text-right text-nutrition-fat">{avg.fat}g</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Mobile stacked layout */}
              <div className="md:hidden space-y-2">
                {summaries.map((day) => (
                  <div key={day.date} className="bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">{formatDate(day.date)}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      <span className="text-nutrition-calories">
                        {Math.round(day.calories).toLocaleString()} cal
                      </span>
                      <span className="text-nutrition-protein">{Math.round(day.protein)}g protein</span>
                      <span className="text-nutrition-carbs">{Math.round(day.carbs)}g carbs</span>
                      <span className="text-nutrition-fat">{Math.round(day.fat)}g fat</span>
                    </div>
                  </div>
                ))}
                {avg && (
                  <div className="bg-gray-100 rounded-lg px-4 py-3 border-t-2 border-gray-300">
                    <p className="text-sm font-semibold text-gray-900 mb-1">7-Day Avg</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs font-semibold">
                      <span className="text-nutrition-calories">{avg.calories.toLocaleString()} cal</span>
                      <span className="text-nutrition-protein">{avg.protein}g protein</span>
                      <span className="text-nutrition-carbs">{avg.carbs}g carbs</span>
                      <span className="text-nutrition-fat">{avg.fat}g fat</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
