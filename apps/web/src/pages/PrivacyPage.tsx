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
      <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.introduction')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('privacy.introductionText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.dataCollected')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('privacy.identificationInfo')}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>{t('privacy.identificationInfoList.0')}</li>
                  <li>{t('privacy.identificationInfoList.1')}</li>
                  <li>{t('privacy.identificationInfoList.2')}</li>
                  <li>{t('privacy.identificationInfoList.3')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('privacy.professionalInfo')}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>{t('privacy.professionalInfoList.0')}</li>
                  <li>{t('privacy.professionalInfoList.1')}</li>
                  <li>{t('privacy.professionalInfoList.2')}</li>
                  <li>{t('privacy.professionalInfoList.3')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.dataUsage')}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('privacy.dataUsageText')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('privacy.dataUsageList.0')}</li>
              <li>{t('privacy.dataUsageList.1')}</li>
              <li>{t('privacy.dataUsageList.2')}</li>
              <li>{t('privacy.dataUsageList.3')}</li>
              <li>{t('privacy.dataUsageList.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.dataSharing')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('privacy.dataSharingText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.security')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('privacy.securityText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.yourRights')}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('privacy.yourRightsText')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('privacy.yourRightsList.0')}</li>
              <li>{t('privacy.yourRightsList.1')}</li>
              <li>{t('privacy.yourRightsList.2')}</li>
              <li>{t('privacy.yourRightsList.3')}</li>
              <li>{t('privacy.yourRightsList.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.contact')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('privacy.contactText')}
              <a href="mailto:privacy@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-700 ml-1">
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
