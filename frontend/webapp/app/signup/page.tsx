'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/auth-context';
import { validateEmail, validatePassword } from '@/lib/utils/password-validator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { buildClassName } from '@/lib/design-system';
import type { SignupRequest } from '@/lib/types';

export default function SignUpPage() {
  const t = useTranslations('auth.signUp');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<SignupRequest>({
    email: '',
    password: '',
    password_confirm: '',
    name: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = tValidation('name.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = tValidation('name.minLength');
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = tValidation('phone.required');
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]; // Show first error
    }

    // Password confirmation
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = tValidation('passwordConfirm.mismatch');
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
      await signup(formData);
      router.push('/');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          setServerError(t('errors.emailExists'));
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

  const passwordValidation = validatePassword(formData.password);

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
            {t('signInPrompt')}{' '}
            <Link href="/signin" className="font-medium text-primary-600 hover:text-primary-500">
              {t('signInLink')}
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
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('fields.name')}
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('fields.namePlaceholder')}
                disabled={isLoading}
                className={buildClassName(
                  'w-full',
                  errors.name && 'border-error-500 focus:ring-error-500'
                )}
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name}</p>
              )}
            </div>

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

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('fields.phone')}
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('fields.phonePlaceholder')}
                disabled={isLoading}
                className={buildClassName(
                  'w-full',
                  errors.phone && 'border-error-500 focus:ring-error-500'
                )}
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
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
                onFocus={() => setShowPasswordRequirements(true)}
                placeholder={t('fields.passwordPlaceholder')}
                disabled={isLoading}
                className={buildClassName(
                  'w-full',
                  errors.password && 'border-error-500 focus:ring-error-500'
                )}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password}</p>
              )}

              {/* Password Requirements */}
              {showPasswordRequirements && formData.password && (
                <div className="mt-2 p-3 bg-neutral-50 rounded-md space-y-2">
                  <p className="text-xs font-medium text-neutral-700">{t('passwordRequirements.title')}</p>
                  <ul className="space-y-1 text-xs">
                    <li className={formData.password.length >= 8 ? 'text-success-600' : 'text-neutral-600'}>
                      ✓ {t('passwordRequirements.minLength')}
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-success-600' : 'text-neutral-600'}>
                      ✓ {t('passwordRequirements.uppercase')}
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-success-600' : 'text-neutral-600'}>
                      ✓ {t('passwordRequirements.lowercase')}
                    </li>
                    <li className={/\d/.test(formData.password) ? 'text-success-600' : 'text-neutral-600'}>
                      ✓ {t('passwordRequirements.digit')}
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-success-600' : 'text-neutral-600'}>
                      ✓ {t('passwordRequirements.special')}
                    </li>
                  </ul>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium">{t('passwordRequirements.strengthLabel')}</span>
                    <div className="flex gap-1 flex-1">
                      <div className={buildClassName(
                        'h-1 flex-1 rounded',
                        passwordValidation.strength === 'weak' ? 'bg-error-500' : 'bg-neutral-200'
                      )} />
                      <div className={buildClassName(
                        'h-1 flex-1 rounded',
                        passwordValidation.strength === 'medium' ? 'bg-warning-500' :
                        passwordValidation.strength === 'strong' ? 'bg-success-500' : 'bg-neutral-200'
                      )} />
                      <div className={buildClassName(
                        'h-1 flex-1 rounded',
                        passwordValidation.strength === 'strong' ? 'bg-success-500' : 'bg-neutral-200'
                      )} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('fields.passwordConfirm')}
              </label>
              <Input
                id="password_confirm"
                type="password"
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                placeholder={t('fields.passwordConfirmPlaceholder')}
                disabled={isLoading}
                className={buildClassName(
                  'w-full',
                  errors.password_confirm && 'border-error-500 focus:ring-error-500'
                )}
                autoComplete="new-password"
              />
              {errors.password_confirm && (
                <p className="mt-1 text-sm text-error-600">{errors.password_confirm}</p>
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
