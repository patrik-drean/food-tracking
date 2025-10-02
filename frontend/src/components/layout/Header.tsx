'use client';

import { format } from 'date-fns';

/**
 * Minimal header component with app branding and current date
 * Sticky positioning for persistent navigation access
 */
export function Header() {
  const today = format(new Date(), 'MMM d, yyyy');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Food Tracker
            </h1>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              {today}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
