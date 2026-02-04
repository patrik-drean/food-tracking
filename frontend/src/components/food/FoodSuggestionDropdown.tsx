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
  /** Ref to input element - clicks on this won't trigger close */
  inputRef?: React.RefObject<HTMLInputElement | null>;
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
  inputRef,
}: FoodSuggestionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside (but not on the input)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isClickOnDropdown = dropdownRef.current?.contains(target);
      const isClickOnInput = inputRef?.current?.contains(target);

      if (!isClickOnDropdown && !isClickOnInput) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isOpen, onClose, inputRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
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
