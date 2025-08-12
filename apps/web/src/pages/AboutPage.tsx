import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title={t('about.ourMission')}
        subtitle={t('about.missionSubtitle')}
        variant="medium"
      />

      {/* Mission Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900">{t('about.ourMission')}</h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
              {t('about.missionDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{t('about.ourValues')}</h2>
            <div className="mx-auto h-1 w-24 bg-blue-600"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Innovation */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-lg">
                <svg className="h-10 w-10 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('about.innovation')}</h3>
              <p className="leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('about.innovationDescription')}
              </p>
            </div>

            {/* Community */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-lg">
                <svg className="h-10 w-10 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('about.community')}</h3>
              <p className="leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('about.communityDescription')}
              </p>
            </div>

            {/* Excellence */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-lg">
                <svg className="h-10 w-10 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('about.excellence')}</h3>
              <p className="leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('about.excellenceDescription')}
              </p>
            </div>

            {/* Transparence */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-lg">
                <svg className="h-10 w-10 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('about.transparency')}</h3>
              <p className="leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('about.transparencyDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{t('about.ourHistory')}</h2>
            <div className="mx-auto h-1 w-24 bg-blue-600"></div>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-gray-50 p-8 md:p-12">
              <p className="mb-6 text-lg leading-relaxed text-gray-700">
                {t('about.historyParagraph1')}
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                {t('about.historyParagraph2')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
