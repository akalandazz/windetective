'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { buildClassName } from '@/lib/design-system';
import Container from './container';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className={buildClassName('bg-background border-b border-border sticky top-0 z-30', className)}>
      <Container>
        <div className="flex items-center justify-between h-16 py-4">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-6 6V17a1 1 0 01-.293.707l-2 2A1 1 0 0112 19.414V12.586l-6-6V4zm2 2.414l4 4V17.586l1 1V10.414l4-4V5H5v1.414z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">CarHistory AI</h1>
              <p className="text-xs text-neutral-600 hidden sm:block">Comprehensive Vehicle Reports</p>
            </div>
          </Link>

          {/* Desktop Navigation and Auth */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <nav className="flex items-center gap-4">
              <Link href="/#features" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-3">
                Features
              </Link>
              <Link href="/#pricing" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-3">
                Pricing
              </Link>
              <Link href="/#about" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-3">
                About
              </Link>
            </nav>

            {/* Auth Section */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-neutral-900">{user.name}</span>
                      <svg className="w-4 h-4 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-neutral-200 py-1 z-20">
                          <div className="px-4 py-3 border-b border-neutral-200">
                            <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                            <p className="text-sm text-neutral-600 truncate">{user.email}</p>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 6 15 7.414z" clipRule="evenodd" />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/signin">
                      <Button variant="ghost" size="sm">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="default" size="sm">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-neutral-500 hover:text-primary-600"
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
      </Container>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <Container>
            <nav className="py-4 space-y-3">
              <Link
                href="/#features"
                className="block text-foreground/80 hover:text-primary text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="block text-foreground/80 hover:text-primary text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/#about"
                className="block text-foreground/80 hover:text-primary text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              {!isLoading && (
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-2 bg-neutral-50 rounded">
                        <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-600">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full">
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" size="sm" className="w-full">
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Header;