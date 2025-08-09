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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.whatIsCookie')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('cookies.whatIsCookieText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.cookieTypes')}</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('cookies.essentialCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.essentialCookiesText')}
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('cookies.performanceCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.performanceCookiesText')}
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('cookies.functionalCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.functionalCookiesText')}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('cookies.advertisingCookies')}</h3>
                <p className="text-gray-600">
                  {t('cookies.advertisingCookiesText')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.thirdPartyCookies')}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('cookies.thirdPartyCookiesText')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Google Analytics</strong> : {t('cookies.thirdPartyCookiesList.0')}</li>
              <li><strong>Google Maps</strong> : {t('cookies.thirdPartyCookiesList.1')}</li>
              <li><strong>Réseaux sociaux</strong> : {t('cookies.thirdPartyCookiesList.2')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.cookieManagement')}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('cookies.cookieManagementText')}
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{t('cookies.browserSettings')}</h3>
                <p className="text-blue-800 text-sm">
                  {t('cookies.browserSettingsText')}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">{t('cookies.disableTools')}</h3>
                <p className="text-green-800 text-sm">
                  {t('cookies.disableToolsText')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.disableImpact')}</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800" dangerouslySetInnerHTML={{ __html: t('cookies.disableImpactText') }}>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.retentionPeriod')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('cookies.retentionPeriodText')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li><strong>{t('cookies.sessionCookies')}</strong> : {t('cookies.sessionCookiesText')}</li>
              <li><strong>{t('cookies.persistentCookies')}</strong> : {t('cookies.persistentCookiesText')}</li>
              <li><strong>{t('cookies.preferenceCookies')}</strong> : {t('cookies.preferenceCookiesText')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.modifications')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('cookies.modificationsText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.contact')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('cookies.contactText')}
              <a href="mailto:cookies@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-700 ml-1">
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
