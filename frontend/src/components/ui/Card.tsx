import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

/**
 * Content card component with configurable padding
 * Provides consistent styling for card-based layouts
 */
export function Card({
  children,
  className,
  padding = 'md'
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
