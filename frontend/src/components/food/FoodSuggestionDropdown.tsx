'use client';

import { useEffect, useRef } from 'react';
import { FoodSuggestionItem } from './FoodSuggestionItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Food {
  id: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isManual: boolean;
}

interface FoodSuggestionDropdownProps {
  suggestions: Food[];
  isLoading: boolean;
  // eslint-disable-next-line no-unused-vars
  onSelect: (selectedFood: Food) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Dropdown component for displaying food suggestions
 * Includes loading state, empty state, and click-outside-to-close behavior
 */
export function FoodSuggestionDropdown({
  suggestions,
  isLoading,
  onSelect,
  onClose,
  isOpen,
}: FoodSuggestionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Loading suggestions...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="py-1">
          {suggestions.map((food) => (
            <FoodSuggestionItem
              key={food.id}
              food={food}
              onClick={() => {
                onSelect(food);
                onClose();
              }}
            />
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">
          No matching foods found in your history
        </div>
      )}
    </div>
  );
}
