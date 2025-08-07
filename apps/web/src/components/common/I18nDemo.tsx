import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedDate } from '../../hooks/useLocalizedDate';
import LanguageSwitcher from './LanguageSwitcher';

const I18nDemo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { formatDate, formatDateTime, formatRelativeDate } = useLocalizedDate();

  const currentDate = new Date();
  const sampleNumber = 1234.56;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('navigation.home')} - i18n Demo
        </h2>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Translations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Basic Translations</h3>
          <div className="space-y-2">
            <p><strong>Navigation:</strong> {t('navigation.home')}</p>
            <p><strong>Loading:</strong> {t('common.loading')}</p>
            <p><strong>Error:</strong> {t('errors.error')}</p>
            <p><strong>Success:</strong> {t('success.success')}</p>
          </div>
        </div>

        {/* Date Formatting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Date Formatting</h3>
          <div className="space-y-2">
            <p><strong>Current Date:</strong> {formatDate(currentDate)}</p>
            <p><strong>Date with Time:</strong> {formatDateTime(currentDate)}</p>
            <p><strong>Relative Date:</strong> {formatRelativeDate(currentDate)}</p>
          </div>
        </div>

        {/* Number Formatting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Number Formatting</h3>
          <div className="space-y-2">
            <p><strong>Sample Number:</strong> {new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US').format(sampleNumber)}</p>
            <p><strong>Currency:</strong> {new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(sampleNumber)}</p>
          </div>
        </div>

        {/* Interpolation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Interpolation</h3>
          <div className="space-y-2">
            <p>{t('success.messageSentToUsers', { count: 5 })}</p>
            <p>{t('success.messageSentToUsers', { count: 1 })}</p>
          </div>
        </div>
      </div>

      {/* Current Language Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Language</h3>
        <p><strong>Language:</strong> {i18n.language}</p>
        <p><strong>Locale:</strong> {i18n.language === 'fr' ? 'fr-FR' : 'en-US'}</p>
        <p><strong>Direction:</strong> {i18n.dir()}</p>
      </div>

      {/* Translation Keys */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Translation Keys</h3>
        <div className="text-sm text-gray-600">
          <p><code>navigation.home</code> → {t('navigation.home')}</p>
          <p><code>navigation.offers</code> → {t('navigation.offers')}</p>
          <p><code>navigation.students</code> → {t('navigation.students')}</p>
          <p><code>common.loading</code> → {t('common.loading')}</p>
          <p><code>errors.error</code> → {t('errors.error')}</p>
        </div>
      </div>
    </div>
  );
};

export default I18nDemo; 