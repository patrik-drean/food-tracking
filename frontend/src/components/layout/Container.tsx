import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Responsive container component with configurable max-widths
 * Provides consistent padding and centering across the app
 */
export function Container({
  children,
  className,
  size = 'lg'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8 py-6',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}
