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
      <div className="min-h-[100dvh] bg-gray-50">

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-lg">
          
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.acceptance')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.acceptanceText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.serviceDescription')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.serviceDescriptionText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.registration')}</h2>
            <div className="space-y-4">
              <p className="leading-relaxed text-gray-600">
                {t('terms.registrationText')}
              </p>
              <ul className="list-inside list-disc space-y-2 text-gray-600">
                <li>{t('terms.registrationList.0')}</li>
                <li>{t('terms.registrationList.1')}</li>
                <li>{t('terms.registrationList.2')}</li>
                <li>{t('terms.registrationList.3')}</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.acceptableUse')}</h2>
            <p className="mb-4 leading-relaxed text-gray-600">
              {t('terms.acceptableUseText')}
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li>{t('terms.acceptableUseList.0')}</li>
              <li>{t('terms.acceptableUseList.1')}</li>
              <li>{t('terms.acceptableUseList.2')}</li>
              <li>{t('terms.acceptableUseList.3')}</li>
              <li>{t('terms.acceptableUseList.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.userContent')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.userContentText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.liability')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.liabilityText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.suspension')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.suspensionText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.modifications')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.modificationsText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.applicableLaw')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.applicableLawText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('terms.contact')}</h2>
            <p className="leading-relaxed text-gray-600">
              {t('terms.contactText')}
              <a href="mailto:legal@adopte-un-etudiant.fr" className="ml-1 text-blue-600 hover:text-blue-700">
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
