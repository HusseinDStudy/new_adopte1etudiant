import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const PrivacyPage = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title={t('privacy.title')}
        description={t('privacy.lastUpdated')}
        variant="default"
      />

      {/* Rest of content */}
      <div className="min-h-[100dvh] bg-gray-50">

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-lg">
          
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.introduction')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('privacy.introductionText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.dataCollected')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{t('privacy.identificationInfo')}</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-600">
                  <li>{t('privacy.identificationInfoList.0')}</li>
                  <li>{t('privacy.identificationInfoList.1')}</li>
                  <li>{t('privacy.identificationInfoList.2')}</li>
                  <li>{t('privacy.identificationInfoList.3')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{t('privacy.professionalInfo')}</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-600">
                  <li>{t('privacy.professionalInfoList.0')}</li>
                  <li>{t('privacy.professionalInfoList.1')}</li>
                  <li>{t('privacy.professionalInfoList.2')}</li>
                  <li>{t('privacy.professionalInfoList.3')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.dataUsage')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">
              {t('privacy.dataUsageText')}
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li>{t('privacy.dataUsageList.0')}</li>
              <li>{t('privacy.dataUsageList.1')}</li>
              <li>{t('privacy.dataUsageList.2')}</li>
              <li>{t('privacy.dataUsageList.3')}</li>
              <li>{t('privacy.dataUsageList.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.dataSharing')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('privacy.dataSharingText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.security')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('privacy.securityText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.yourRights')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">
              {t('privacy.yourRightsText')}
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li>{t('privacy.yourRightsList.0')}</li>
              <li>{t('privacy.yourRightsList.1')}</li>
              <li>{t('privacy.yourRightsList.2')}</li>
              <li>{t('privacy.yourRightsList.3')}</li>
              <li>{t('privacy.yourRightsList.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('privacy.contact')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('privacy.contactText')}
              <a href="mailto:privacy@adopte-un-etudiant.fr" className="ml-1 text-blue-600 hover:text-blue-700">
                privacy@adopte-un-etudiant.fr
              </a>
            </p>
          </section>

        </div>
      </div>
      </div>
    </>
  );
};

export default PrivacyPage;
