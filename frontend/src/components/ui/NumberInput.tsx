import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string | undefined;
  helpText?: string;
  suffix?: string;
}

/**
 * Number input component with optional label, error, suffix
 * Optimized for nutrition value inputs
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, helpText, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            className={cn(
              'block w-full rounded-lg border-gray-300 shadow-sm',
              'focus:border-primary-500 focus:ring-primary-500',
              'disabled:bg-gray-50 disabled:text-gray-500',
              'transition-colors',
              suffix && 'pr-10',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">{suffix}</span>
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1.5 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
