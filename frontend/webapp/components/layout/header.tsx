import React, { useState } from 'react';
import { buildClassName } from '@/lib/design-system';
import Container from './container';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className={buildClassName('bg-white border-b border-neutral-200 sticky top-0 z-30', className)}>
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-6 6V17a1 1 0 01-.293.707l-2 2A1 1 0 0112 19.414V12.586l-6-6V4zm2 2.414l4 4V17.586l1 1V10.414l4-4V5H5v1.414z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">CarHistory AI</h1>
              <p className="text-xs text-neutral-600 hidden sm:block">Comprehensive Vehicle Reports</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
            >
              Pricing
            </a>
            <a 
              href="#about" 
              className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
            >
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Help Button */}
            <button 
              className="p-2 text-neutral-500 hover:text-primary-600 transition-colors duration-200"
              aria-label="Help"
              title="Get help"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-neutral-500 hover:text-primary-600 transition-colors duration-200"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              title={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <Container>
            <nav className="py-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-neutral-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Header;