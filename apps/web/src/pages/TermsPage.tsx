import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const TermsPage = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title={t('terms.title')}
        description={t('terms.lastUpdated')}
        variant="default"
      />

      {/* Rest of content */}
      <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.acceptance')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.acceptanceText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.serviceDescription')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.serviceDescriptionText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.registration')}</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                {t('terms.registrationText')}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('terms.registrationList.0')}</li>
                <li>{t('terms.registrationList.1')}</li>
                <li>{t('terms.registrationList.2')}</li>
                <li>{t('terms.registrationList.3')}</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.acceptableUse')}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('terms.acceptableUseText')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('terms.acceptableUseList.0')}</li>
              <li>{t('terms.acceptableUseList.1')}</li>
              <li>{t('terms.acceptableUseList.2')}</li>
              <li>{t('terms.acceptableUseList.3')}</li>
              <li>{t('terms.acceptableUseList.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.userContent')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.userContentText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.liability')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.liabilityText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.suspension')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.suspensionText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.modifications')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.modificationsText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.applicableLaw')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.applicableLawText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.contact')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('terms.contactText')}
              <a href="mailto:legal@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-700 ml-1">
                legal@adopte-un-etudiant.fr
              </a>
            </p>
          </section>

        </div>
      </div>
      </div>
    </>
  );
};

export default TermsPage;
