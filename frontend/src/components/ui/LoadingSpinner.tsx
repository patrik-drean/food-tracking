import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated loading spinner component
 * Used for async operations and loading states
 */
export function LoadingSpinner({
  className,
  size = 'md'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-300 border-t-primary-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
