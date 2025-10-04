import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  helpText?: string;
  rightIcon?: ReactNode;
}

/**
 * Reusable input component with label, error, and help text support
 * Integrates with React Hook Form via forwardRef
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, rightIcon, ...props }, ref) => {
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
            className={cn(
              'block w-full rounded-lg border-gray-300 shadow-sm',
              'focus:border-primary-500 focus:ring-primary-500',
              'disabled:bg-gray-50 disabled:text-gray-500',
              'transition-colors',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {rightIcon}
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

Input.displayName = 'Input';
