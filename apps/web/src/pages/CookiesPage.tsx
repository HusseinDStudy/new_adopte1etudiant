import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const CookiesPage = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title={t('cookies.title')}
        description={t('cookies.lastUpdated')}
        variant="default"
      />

      {/* Rest of content */}
      <div className="min-h-[100dvh] bg-gray-50">

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-lg">
          
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.whatIsCookie')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('cookies.whatIsCookieText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.cookieTypes')}</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{t('cookies.essentialCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.essentialCookiesText')}
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{t('cookies.performanceCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.performanceCookiesText')}
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{t('cookies.functionalCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.functionalCookiesText')}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{t('cookies.advertisingCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.advertisingCookiesText')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.thirdPartyCookies')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">
              {t('cookies.thirdPartyCookiesText')}
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li><strong>Google Analytics</strong> : {t('cookies.thirdPartyCookiesList.0')}</li>
              <li><strong>Google Maps</strong> : {t('cookies.thirdPartyCookiesList.1')}</li>
              <li><strong>Réseaux sociaux</strong> : {t('cookies.thirdPartyCookiesList.2')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.cookieManagement')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">
              {t('cookies.cookieManagementText')}
            </p>
            
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">{t('cookies.browserSettings')}</h3>
                <p className="text-sm text-blue-800">
                  {t('cookies.browserSettingsText')}
                </p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="mb-2 font-semibold text-green-900">{t('cookies.disableTools')}</h3>
                <p className="text-sm text-green-800">
                  {t('cookies.disableToolsText')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.disableImpact')}</h2>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-yellow-800" dangerouslySetInnerHTML={{ __html: t('cookies.disableImpactText') }}>
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.retentionPeriod')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('cookies.retentionPeriodText')}
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-gray-600">
              <li><strong>{t('cookies.sessionCookies')}</strong> : {t('cookies.sessionCookiesText')}</li>
              <li><strong>{t('cookies.persistentCookies')}</strong> : {t('cookies.persistentCookiesText')}</li>
              <li><strong>{t('cookies.preferenceCookies')}</strong> : {t('cookies.preferenceCookiesText')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.modifications')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('cookies.modificationsText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('cookies.contact')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('cookies.contactText')}
              <a href="mailto:cookies@adopte-un-etudiant.fr" className="ml-1 text-blue-600 hover:text-blue-700">
                cookies@adopte-un-etudiant.fr
              </a>
            </p>
          </section>

        </div>
      </div>
      </div>
    </>
  );
};

export default CookiesPage;
