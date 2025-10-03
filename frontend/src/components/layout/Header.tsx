'use client';

/**
 * Minimal header component with app branding
 * Sticky positioning for persistent navigation access
 */
export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Food Tracker
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
