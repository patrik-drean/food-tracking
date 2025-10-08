'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function GraphQLErrorBoundary({
  children,
  fallback = <div>Something went wrong</div>
}: ErrorBoundaryProps) {
  // Implementation would use React Error Boundary patterns
  // For now, just return children. In a real implementation,
  // this would catch errors and show the fallback
  // Suppress unused variable warning
  void fallback;
  return <>{children}</>;
}
