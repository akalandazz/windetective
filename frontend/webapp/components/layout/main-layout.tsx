import React from 'react';
import type { LayoutProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';
import Header from './header';
import Container from './container';

const MainLayout: React.FC<LayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  className = '',
}) => {
  return (
    <div className={buildClassName('min-h-screen bg-background', className)}>
      {/* Custom Header or Default Header */}
      {header || <Header />}
      
      {/* Main Content Area */}
      <main className="flex-1">
        <div className="py-6 sm:py-8 lg:py-12">
          <Container>
            <div className="flex gap-8">
              {/* Sidebar */}
              {sidebar && (
                <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                  <div className="sticky top-24">
                    {sidebar}
                  </div>
                </aside>
              )}
              
              {/* Main Content */}
              <div className={buildClassName('flex-1', sidebar ? 'lg:max-w-none' : 'max-w-4xl mx-auto')}>
                {children}
              </div>
            </div>
          </Container>
        </div>
      </main>
      
      {/* Footer */}
      {footer && (
        <footer className="bg-background border-t border-border">
          <Container>
            <div className="py-8">
              {footer}
            </div>
          </Container>
        </footer>
      )}
      
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary-600 text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default MainLayout;