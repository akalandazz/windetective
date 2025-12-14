'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/main-layout';
import VinInput from '@/components/vin-input';
import LoadingOverlay from '@/components/loading-overlay';
import ExecutiveSummary from '@/components/executive-summary';
import { useReport } from '@/lib/hooks/use-report';
import { buildClassName } from '@/lib/design-system';
import { ProtectedRoute } from '@/lib/components/protected-route';

export default function HomePage() {
  const t = useTranslations('home');
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  const {
    report,
    state,
    generateReport,
    cancelReport,
    reset,
    isLoading,
    hasError,
    error
  } = useReport({
    onSuccess: (report) => {
      console.log('Report generated successfully:', report.vin);
    },
    onError: (error) => {
      console.error('Failed to generate report:', error);
    },
  });

  const handleVinSubmit = async (vin: string) => {
    await generateReport(vin);
  };

  const handleViewDetails = () => {
    setShowDetailedReport(true);
  };

  const handleStartOver = () => {
    reset();
    setShowDetailedReport(false);
  };

  // Hero Section Component
  const HeroSection = () => (
    <div className="text-center mb-12">
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">
          {t('hero.title.main')}{' '}
          <span className="text-primary-600 block sm:inline sm:ml-3">
            {t('hero.title.highlight')}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        <div className="text-center p-6 bg-white rounded-lg border border-neutral-200">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">{t('features.accurate.title')}</h3>
          <p className="text-sm text-neutral-600">{t('features.accurate.description')}</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg border border-neutral-200">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">{t('features.comprehensive.title')}</h3>
          <p className="text-sm text-neutral-600">{t('features.comprehensive.description')}</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg border border-neutral-200">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">{t('features.instant.title')}</h3>
          <p className="text-sm text-neutral-600">{t('features.instant.description')}</p>
        </div>
      </div>
    </div>
  );

  // Current state-based content rendering
  const getCurrentContent = () => {
    // Show detailed report view
    if (showDetailedReport && report) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{t('report.detailed.title')}</h2>
              <p className="text-neutral-600">{t('report.detailed.vinLabel', { vin: report.vin })}</p>
            </div>
            <button
              onClick={handleStartOver}
              className="btn btn-secondary focus-ring"
            >
              {t('report.buttons.generateNew')}
            </button>
          </div>
          
          <div className="text-center py-12 bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t('report.detailed.comingSoon.title')}
              </h3>
              <p className="text-neutral-600 mb-4">
                {t('report.detailed.comingSoon.description')}
              </p>
              <button
                onClick={() => setShowDetailedReport(false)}
                className="btn btn-primary focus-ring"
              >
                {t('report.detailed.comingSoon.backButton')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show completed report (executive summary)
    if (report && state.status === 'completed') {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('report.success.badge')}
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              {t('report.success.title', { vin: report.vin })}
            </h2>
            <p className="text-neutral-600">
              {t('report.success.subtitle', {
                date: report.generatedAt.toLocaleDateString(),
                count: report.providersUsed.length
              })}
            </p>
          </div>

          <ExecutiveSummary
            summary={report.executiveSummary}
            onViewDetails={handleViewDetails}
            className="mb-6"
          />

          <div className="text-center">
            <button
              onClick={handleStartOver}
              className="btn btn-outline focus-ring"
            >
              {t('report.buttons.generateAnother')}
            </button>
          </div>
        </div>
      );
    }

    // Show loading state - handled by overlay now
    // The overlay will show when isLoading is true

    // Show VIN input form (initial state)
    return (
      <>
        <HeroSection />
        
        <div className="max-w-2xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              {t('vinInput.heading')}
            </h2>
            <p className="text-neutral-600">
              {t('vinInput.description')}
            </p>
          </div>

          <VinInput
            onSubmit={handleVinSubmit}
            isLoading={isLoading}
            error={error || undefined}
            placeholder={t('vinInput.placeholder')}
            className="mb-8"
          />

          {/* Trust Indicators */}
          <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-neutral-900 mb-4">{t('trust.heading')}</h3>
            <div className="flex items-center justify-center gap-8 text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm">{t('trust.secure')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm">{t('trust.officialSources')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm">{t('trust.aiPowered')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sample VIN for demo */}
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-2">
            {t('demo.text')}
          </p>
          <button
            onClick={() => handleVinSubmit('1HGBH41JXMN109186')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium underline transition-colors duration-200"
            disabled={isLoading}
          >
            {t('demo.sampleButton', { vin: '1HGBH41JXMN109186' })}
          </button>
        </div>
      </>
    );
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div id="main-content" className="focus:outline-none" tabIndex={-1}>
          {getCurrentContent()}
        </div>

        <LoadingOverlay
          isVisible={isLoading}
          state={state}
          onCancel={cancelReport}
        />
      </MainLayout>
    </ProtectedRoute>
  );
}
