'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DayFoodLogModal } from './DayFoodLogModal';

const WEEKLY_SUMMARY_QUERY = `
  query WeeklySummary($days: Int, $startDate: String, $endDate: String) {
    weeklySummary(days: $days, startDate: $startDate, endDate: $endDate) {
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

type Period = '7' | '30' | 'custom';

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

function todayMTDateStr() {
  const parts = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = parts.split('/');
  return `${year}-${month}-${day}`;
}

function buildMarkdown(
  summaries: DailySummary[],
  avg: ReturnType<typeof computeAverages> | null,
  label: string
) {
  const header = `# Nutrition Summary — ${label}`;
  const tableHeader = '| Date | Calories | Protein (g) | Carbs (g) | Fat (g) |';
  const tableDivider = '|------|---------:|------------:|----------:|--------:|';
  const rows = summaries
    .slice()
    .reverse()
    .map((day) => {
      const isEmpty = day.calories === 0 && day.protein === 0 && day.carbs === 0 && day.fat === 0;
      if (isEmpty) {
        return `| ${formatDate(day.date)} | — | — | — | — |`;
      }
      return `| ${formatDate(day.date)} | ${Math.round(day.calories)} | ${Math.round(
        day.protein
      )} | ${Math.round(day.carbs)} | ${Math.round(day.fat)} |`;
    });
  const avgRow = avg
    ? `| **Average** | **${avg.calories}** | **${avg.protein}** | **${avg.carbs}** | **${avg.fat}** |`
    : '';
  return [header, '', tableHeader, tableDivider, ...rows, avgRow].filter(Boolean).join('\n');
}

export function WeeklyNutritionSummary() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('7');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState(todayMTDateStr());
  const [copied, setCopied] = useState(false);

  const variables = useMemo(() => {
    if (period === 'custom') {
      return { startDate: customStart, endDate: customEnd };
    }
    return { days: period === '30' ? 30 : 7 };
  }, [period, customStart, customEnd]);

  const customValid =
    period !== 'custom' ||
    (customStart !== '' && customEnd !== '' && customStart <= customEnd);

  const [{ data, fetching, error }] = useQuery({
    query: WEEKLY_SUMMARY_QUERY,
    variables,
    requestPolicy: 'cache-and-network',
    pause: !isExpanded || !customValid,
  });

  const summaries: DailySummary[] = data?.weeklySummary || [];
  const avg = summaries.length > 0 ? computeAverages(summaries) : null;

  const periodLabel =
    period === 'custom'
      ? customStart && customEnd
        ? `${customStart} to ${customEnd}`
        : 'Custom range'
      : `${period}-Day`;
  const avgLabel = period === 'custom' ? 'Avg' : `${period}-Day Avg`;

  const handleCopy = async () => {
    if (!summaries.length) return;
    const md = buildMarkdown(summaries, avg, periodLabel);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  };

  const periodButtonClass = (value: Period) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      period === value
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <>
    <Card padding="none">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">Nutrition Summary</h3>
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
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button type="button" className={periodButtonClass('7')} onClick={() => setPeriod('7')}>
                7 days
              </button>
              <button type="button" className={periodButtonClass('30')} onClick={() => setPeriod('30')}>
                30 days
              </button>
              <button
                type="button"
                className={periodButtonClass('custom')}
                onClick={() => setPeriod('custom')}
              >
                Custom
              </button>
            </div>
            {period === 'custom' && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!summaries.length}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy summary as markdown"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {period === 'custom' && !customValid ? (
            <p className="text-sm text-gray-500 text-center py-6">
              Select a start and end date to view the summary.
            </p>
          ) : fetching && !data ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-6">Failed to load summary</p>
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
                    {summaries.map((day) => {
                      const isEmpty = day.calories === 0 && day.protein === 0 && day.carbs === 0 && day.fat === 0;
                      return (
                        <tr
                          key={day.date}
                          className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedDate(day.date)}
                          title="Click to view food log"
                        >
                          <td className="py-2 pr-4 text-gray-700 font-medium">{formatDate(day.date)}</td>
                          {isEmpty ? (
                            <>
                              <td className="py-2 px-2 text-right text-gray-400">—</td>
                              <td className="py-2 px-2 text-right text-gray-400">—</td>
                              <td className="py-2 px-2 text-right text-gray-400">—</td>
                              <td className="py-2 px-2 text-right text-gray-400">—</td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-2 text-right text-gray-900">
                                {Math.round(day.calories).toLocaleString()}
                              </td>
                              <td className="py-2 px-2 text-right text-gray-900">{Math.round(day.protein)}g</td>
                              <td className="py-2 px-2 text-right text-gray-900">{Math.round(day.carbs)}g</td>
                              <td className="py-2 px-2 text-right text-gray-900">{Math.round(day.fat)}g</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  {avg && (
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-semibold">
                        <td className="py-2 pr-4 text-gray-700">{avgLabel}</td>
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
                {summaries.map((day) => {
                  const isEmpty = day.calories === 0 && day.protein === 0 && day.carbs === 0 && day.fat === 0;
                  return (
                    <button
                      key={day.date}
                      className="w-full text-left bg-gray-50 rounded-lg px-4 py-3 hover:bg-blue-50 transition-colors"
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">{formatDate(day.date)}</p>
                      {isEmpty ? (
                        <span className="text-xs text-gray-400">No data</span>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                          <span className="text-nutrition-calories">
                            {Math.round(day.calories).toLocaleString()} cal
                          </span>
                          <span className="text-nutrition-protein">{Math.round(day.protein)}g protein</span>
                          <span className="text-nutrition-carbs">{Math.round(day.carbs)}g carbs</span>
                          <span className="text-nutrition-fat">{Math.round(day.fat)}g fat</span>
                        </div>
                      )}
                    </button>
                  );
                })}
                {avg && (
                  <div className="bg-gray-100 rounded-lg px-4 py-3 border-t-2 border-gray-300">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{avgLabel}</p>
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

      {selectedDate && (
        <DayFoodLogModal
          date={selectedDate}
          isOpen={true}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
