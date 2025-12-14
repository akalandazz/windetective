'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/auth-context';
import { validateEmail } from '@/lib/utils/password-validator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { buildClassName } from '@/lib/design-system';

export default function SignInPage() {
  const t = useTranslations('auth.signIn');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }

    if (!formData.password) {
      newErrors.password = tValidation('password.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setServerError(t('errors.invalidCredentials'));
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError(t('errors.unexpected'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-6 6V17a1 1 0 01-.293.707l-2 2A1 1 0 0112 19.414V12.586l-6-6V4zm2 2.414l4 4V17.586l1 1V10.414l4-4V5H5v1.414z"/>
              </svg>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-neutral-900">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {t('createAccountPrompt')}{' '}
            <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              {t('createAccountLink')}
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          {serverError && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('fields.email')}
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('fields.emailPlaceholder')}
                disabled={isLoading}
                className={buildClassName(
                  'w-full',
                  errors.email && 'border-error-500 focus:ring-error-500'
                )}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('fields.password')}
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('fields.passwordPlaceholder')}
                disabled={isLoading}
                className={buildClassName(
                  'w-full',
                  errors.password && 'border-error-500 focus:ring-error-500'
                )}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t('submittingButton') : t('submitButton')}
          </Button>

          {/* Footer Links */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              {tCommon('buttons.back')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
