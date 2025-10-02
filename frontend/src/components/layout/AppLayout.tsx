import { ReactNode } from 'react';
import { Header } from './Header';
import { Container } from './Container';

interface AppLayoutProps {
  children: ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Main application layout wrapper
 * Includes header and responsive content container
 */
export function AppLayout({ children, containerSize = 'lg' }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-16">
        <Container size={containerSize}>
          {children}
        </Container>
      </main>
    </div>
  );
}
